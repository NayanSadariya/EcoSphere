import mongoose from 'mongoose';
import FleetLog from '../models/FleetLog.js';
import PurchaseRecord from '../models/PurchaseRecord.js';
import ManufacturingRecord from '../models/ManufacturingRecord.js';
import ExpenseRecord from '../models/ExpenseRecord.js';
import EmissionFactor from '../models/EmissionFactor.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import Settings from '../models/Settings.js';

class AutoEmissionService {
  
  static async isEnabled() {
    try {
      const settings = await Settings.findOne({});
      return settings ? settings.auto_emission_calculation_enabled : true; // Default to true
    } catch (error) {
      console.error('Error checking auto emission setting:', error);
      return true; // Default to true on error
    }
  }

  /**
   * Calculate CO2 emissions from a fleet log entry
   * @param {Object} fleetLog - The fleet log document
   * @returns {Promise<number>} CO2 emissions in kg
   */
  static async calculateFleetEmission(fleetLog) {
    try {
      // Find appropriate emission factor for fuel consumption
      // This is simplified - in reality, we'd match by fuel type, vehicle type, etc.
      const emissionFactor = await EmissionFactor.findOne({
        category: 'FUEL_CONSUMPTION',
        name: /diesel|gasoline|petrol/i
      });

      if (!emissionFactor) {
        // Default emission factor for diesel: 2.68 kg CO2 per liter
        return fleetLog.fuel_liters * 2.68;
      }

      return fleetLog.fuel_liters * emissionFactor.co2_factor_value;
    } catch (error) {
      console.error('Error calculating fleet emission:', error);
      // Return a default calculation
      return fleetLog.fuel_liters * 2.68;
    }
  }

  /**
   * Calculate CO2 emissions from a purchase record
   * @param {Object} purchaseRecord - The purchase record document
   * @returns {Promise<number>} CO2 emissions in kg
   */
  static async calculatePurchaseEmission(purchaseRecord) {
    try {
      // Find emission factor based on item category
      const emissionFactor = await EmissionFactor.findOne({
        category: 'PURCHASED_GOODS',
        name: new RegExp(purchaseRecord.item_category, 'i')
      });

      if (!emissionFactor) {
        // Default emission factor for general goods: 0.5 kg CO2 per unit
        return purchaseRecord.quantity * 0.5;
      }

      return purchaseRecord.quantity * emissionFactor.co2_factor_value;
    } catch (error) {
      console.error('Error calculating purchase emission:', error);
      // Return a default calculation
      return purchaseRecord.quantity * 0.5;
    }
  }

  /**
   * Calculate CO2 emissions from a manufacturing record
   * @param {Object} manufacturingRecord - The manufacturing record document
   * @returns {Promise<number>} CO2 emissions in kg
   */
  static async calculateManufacturingEmission(manufacturingRecord) {
    try {
      // Find emission factor based on process type
      const emissionFactor = await EmissionFactor.findOne({
        category: 'MANUFACTURING_PROCESS',
        name: new RegExp(manufacturingRecord.process_type, 'i')
      });

      if (!emissionFactor) {
        // Default emission factor for manufacturing: 0.1 kg CO2 per unit
        return manufacturingRecord.output_units * 0.1;
      }

      return manufacturingRecord.output_units * emissionFactor.co2_factor_value;
    } catch (error) {
      console.error('Error calculating manufacturing emission:', error);
      // Return a default calculation
      return manufacturingRecord.output_units * 0.1;
    }
  }

  /**
   * Calculate CO2 emissions from an expense record
   * @param {Object} expenseRecord - The expense record document
   * @returns {Promise<number>} CO2 emissions in kg
   */
  static async calculateExpenseEmission(expenseRecord) {
    try {
      // Find emission factor based on expense type
      const emissionFactor = await EmissionFactor.findOne({
        category: 'EXPENSE',
        name: new RegExp(expenseRecord.expense_type, 'i')
      });

      if (!emissionFactor) {
        // Default emission factor for expenses: 0.1 kg CO2 per dollar
        return expenseRecord.amount * 0.1;
      }

      return expenseRecord.amount * emissionFactor.co2_factor_value;
    } catch (error) {
      console.error('Error calculating expense emission:', error);
      // Return a default calculation
      return expenseRecord.amount * 0.1;
    }
  }

  /**
   * Create a carbon transaction from a source record
   * @param {Object} sourceRecord - The source record (fleet log, purchase record, etc.)
   * @param {string} sourceType - Type of source record
   * @param {number} calculatedCO2 - Pre-calculated CO2 emissions
   * @returns {Promise<Object>} Created carbon transaction
   */
  static async createCarbonTransaction(sourceRecord, sourceType, calculatedCO2) {
    try {
      // Find an appropriate emission factor (this would be more sophisticated in practice)
      let emissionFactor;
      switch (sourceType) {
        case 'FLEET':
          emissionFactor = await EmissionFactor.findOne({
            category: 'FUEL_CONSUMPTION'
          }) || await EmissionFactor.findOne({}) // fallback to any factor
          break;
        case 'PURCHASE':
          emissionFactor = await EmissionFactor.findOne({
            category: 'PURCHASED_GOODS'
          }) || await EmissionFactor.findOne({})
          break;
        case 'MANUFACTURING':
          emissionFactor = await EmissionFactor.findOne({
            category: 'MANUFACTURING_PROCESS'
          }) || await EmissionFactor.findOne({})
          break;
        case 'EXPENSE':
          emissionFactor = await EmissionFactor.findOne({
            category: 'EXPENSE'
          }) || await EmissionFactor.findOne({})
          break;
        default:
          emissionFactor = await EmissionFactor.findOne({});
      }

      // If still no emission factor found, create a default one
      if (!emissionFactor) {
        emissionFactor = await EmissionFactor.create({
          name: 'Default Factor',
          category: 'DEFAULT',
          unit: 'unit',
          co2_factor_value: 1.0
        });
      }

      const carbonTransaction = await CarbonTransaction.create({
        department: sourceRecord.department,
        source_type: sourceType,
        source_record_id: sourceRecord._id,
        emission_factor: emissionFactor._id,
        calculated_co2: calculatedCO2,
        date: sourceRecord.date,
        is_auto_calculated: true
      });

      return carbonTransaction;
    } catch (error) {
      console.error('Error creating carbon transaction:', error);
      throw error;
    }
  }

  /**
   * Process all pending source records and create carbon transactions
   * This should be run periodically (e.g., hourly)
   */
  static async processAllSourceRecords() {
    try {
      // Check if auto calculation is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        console.log('Auto emission calculation is disabled');
        return { processed: 0, message: 'Auto emission calculation is disabled' };
      }

      let processedCount = 0;

      // Process unprocessed fleet logs
      const fleetLogs = await FleetLog.find({});
      for (const log of fleetLogs) {
        // Check if we already have a carbon transaction for this log
        const existingTransaction = await CarbonTransaction.findOne({
          source_type: 'FLEET',
          source_record_id: log._id
        });

        if (!existingTransaction) {
          const co2 = await this.calculateFleetEmission(log);
          await this.createCarbonTransaction(log, 'FLEET', co2);
          processedCount++;
        }
      }

      // Process unprocessed purchase records
      const purchaseRecords = await PurchaseRecord.find({});
      for (const record of purchaseRecords) {
        const existingTransaction = await CarbonTransaction.findOne({
          source_type: 'PURCHASE',
          source_record_id: record._id
        });

        if (!existingTransaction) {
          const co2 = await this.calculatePurchaseEmission(record);
          await this.createCarbonTransaction(record, 'PURCHASE', co2);
          processedCount++;
        }
      }

      // Process unprocessed manufacturing records
      const manufacturingRecords = await ManufacturingRecord.find({});
      for (const record of manufacturingRecords) {
        const existingTransaction = await CarbonTransaction.findOne({
          source_type: 'MANUFACTURING',
          source_record_id: record._id
        });

        if (!existingTransaction) {
          const co2 = await this.calculateManufacturingEmission(record);
          await this.createCarbonTransaction(record, 'MANUFACTURING', co2);
          processedCount++;
        }
      }

      // Process unprocessed expense records
      const expenseRecords = await ExpenseRecord.find({});
      for (const record of expenseRecords) {
        const existingTransaction = await CarbonTransaction.findOne({
          source_type: 'EXPENSE',
          source_record_id: record._id
        });

        if (!existingTransaction) {
          const co2 = await this.calculateExpenseEmission(record);
          await this.createCarbonTransaction(record, 'EXPENSE', co2);
          processedCount++;
        }
      }

      return {
        processed: processedCount,
        message: `Processed ${processedCount} source records for auto emission calculation`
      };
    } catch (error) {
      console.error('Error processing source records for auto emission:', error);
      throw error;
    }
  }

  /**
   * Calculate CO2 emissions from a specific source record
   * @param {string} sourceType - Type of source record
   * @param {string} sourceId - ID of the source record
   * @returns {Promise<Object>} Result with calculated CO2 and created transaction
   */
  static async calculateEmissionFromSource(sourceType, sourceId) {
    try {
      let sourceRecord;
      let calculateFunction;

      switch (sourceType) {
        case 'FLEET':
          sourceRecord = await FleetLog.findById(sourceId);
          calculateFunction = this.calculateFleetEmission;
          break;
        case 'PURCHASE':
          sourceRecord = await PurchaseRecord.findById(sourceId);
          calculateFunction = this.calculatePurchaseEmission;
          break;
        case 'MANUFACTURING':
          sourceRecord = await ManufacturingRecord.findById(sourceId);
          calculateFunction = this.calculateManufacturingEmission;
          break;
        case 'EXPENSE':
          sourceRecord = await ExpenseRecord.findById(sourceId);
          calculateFunction = this.calculateExpenseEmission;
          break;
        default:
          throw new Error(`Invalid source type: ${sourceType}`);
      }

      if (!sourceRecord) {
        throw new Error(`${sourceType} record not found`);
      }

      // Check if we already have a carbon transaction for this source
      const existingTransaction = await CarbonTransaction.findOne({
        source_type: sourceType,
        source_record_id: sourceId
      });

      if (existingTransaction) {
        return {
          success: false,
          message: 'Carbon transaction already exists for this source',
          transaction: existingTransaction
        };
      }

      // Calculate CO2 emissions
      const calculatedCO2 = await calculateFunction(sourceRecord);

      // Create carbon transaction
      const carbonTransaction = await this.createCarbonTransaction(
        sourceRecord,
        sourceType,
        calculatedCO2
      );

      return {
        success: true,
        calculatedCO2,
        transaction: carbonTransaction
      };
    } catch (error) {
      console.error('Error calculating emission from source:', error);
      throw error;
    }
  }
}

export default AutoEmissionService;