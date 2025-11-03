const { Router } = require('express');
const response = require('../../network/response')
const router = Router();
const ctrl = require('./index');
const dummyDataset = require("../../database/dummyDatasets");
const data = dummyDataset.dummyDataset();
const {tiMonth,fuelEnergySelector, electricalConsumption,costElectricalKM,combustionConsumption,
    fuelConsumption,
    fuelEfficiency,
    fuelCostKm,
    energyKm,
    emisionKm,
    savedEnergy,
    avoidedEmissions,
    monthlySavings,
    annualSavings,
    youngTree, 
    oldTree,  
    energyH2Cylinders,
    energyH2LowPresure,
    energyConsumed,
    hydrogenMass,
    litersRequired} = require('../../calculators/environment')

const tableInjected = 'my_table'


router.get('/environment/:ipc/:fes', async (req, res) => {
    try {
        let list={}
        const nominal_energy=8.14
        const autonomy_nominal=14.7
        const annual_use=82084.9
        const ipc=tiMonth(parseFloat(req.params.ipc))
        const fes = fuelEnergySelector(req.params.fes)
        const electrical_consumption =  electricalConsumption(nominal_energy,autonomy_nominal)
        const cost_electrical_km= costElectricalKM(electrical_consumption,978.81)
        const combustion_Consumption=combustionConsumption(electrical_consumption)
        const fuel_consumption=fuelConsumption(combustion_Consumption,fes['fuel_energy'])
        const fuel_Efficiency=fuelEfficiency(fuel_consumption)  
        const fuel_cost_KM= fuelCostKm(fes['fuel_price'],fuel_consumption)
        const energy_KM=energyKm(combustion_Consumption)
        const emision_KM=emisionKm(data["emision_factor_gasoline"],energy_KM)
        const saved_energy=savedEnergy(combustion_Consumption,electrical_consumption,annual_use)
        const avoided_emissions=avoidedEmissions(emision_KM,annual_use)
        const monthly_savings=monthlySavings(fuel_cost_KM, cost_electrical_km, annual_use)
        
        const young_tree=youngTree(avoided_emissions)
        const annual_savings=annualSavings(monthly_savings,ipc)
        const old_tree=oldTree(avoided_emissions)
        const energy_H2_Cylinders=energyH2Cylinders(nominal_energy)
        const energy_H2_Low_Presure=energyH2LowPresure(energy_H2_Cylinders)
        const energy_consumed=energyConsumed(energy_H2_Low_Presure)
        const hydrogen_mass=hydrogenMass(energy_H2_Low_Presure)
        const liters_Required=litersRequired(hydrogen_mass) 
        list["It_month"]=ipc
        list["Fuel_energy_selector"]=fes
        list["Electrical_consumption"]=electrical_consumption
        list["Cost_electrical_KM"]=cost_electrical_km
        list["Combustion_Consumption"]=combustion_Consumption
        list["Fuel_Consumption"]=fuel_consumption
        list["Fuel_Efficiency"]=fuel_Efficiency
        list["Fuel_COST_KM"]=fuel_cost_KM
        list["Energy_KM"]=energy_KM
        list["Emisions_KM"]=emision_KM
        list["Saved_energy"]=saved_energy
        list["Avoided_Emisions"]=avoided_emissions
        list["Monthly_Savings"]=monthly_savings
        list["Annual_Savings"]=annual_savings
        list["Young_Tree"]=young_tree
        list["Old_Tree"]=old_tree
        list["Energy_H2_Cylinders"]=energy_H2_Cylinders
        list["Energy_H2_Lowpresure"]=energy_H2_Low_Presure
        list["Energy_Consumed"]=energy_consumed
        list["Hydrogen_Mass"]=hydrogen_mass
        list["Liters_Required"]=liters_Required
    
        response.success(req,res,list,200)  
    } catch (error) {
        response.error(req, res, error.message, 500); 
    }
})
router.post('/environment/:id', async (req, res) => {
    try {
        

         response.success(req,res,list,200) 
         } catch (error) {
        response.error(req, res, error.message, 500); 
    }
})
module.exports = router ;