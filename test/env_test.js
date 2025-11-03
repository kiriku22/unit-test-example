const {test, describe, it} = require('node:test');
const assert = require('node:assert');
const {tiMonth, fuelEnergySelector, fuelConsumption, combustionConsumption, electricalConsumption} = require("../calculators/environment")

const electrical_consumption = electricalConsumption(81.14, 200)
const combustion_consumption = combustionConsumption(electrical_consumption)
const fuel_selector = fuelEnergySelector("Diesel")


test('env_ipc', () => { 
    assert.strictEqual(tiMonth(2.8), 0.0023039138595752906)
})


describe("FuelEnergySelector colection", () => {
    it("gasoline case", () => {
        assert.deepStrictEqual(fuelEnergySelector("gasoline"),{
            "fuel_price": 16700,
            "fuel_energy": 35.58,
            "emision_factor": 69.25
        })
    })

    it("diesel case", () => {
        assert.deepStrictEqual(fuelEnergySelector("diesel"),{
            "fuel_price": 11795,
            "fuel_energy": 40.7,
            "emision_factor": 74.01
        })
    })
})

test("fuelConsuption Test", () => {
    assert.strictEqual(
        fuelConsumption(
            combustion_consumption, 
            fuel_selector["fuel_energy"]), 
        0.04102081879859657
    )
})
describe("Complete Environment Calculator Suite", () => {
  // Variables para tests adicionales
  const annual_use = 15000
  const cost_electrical_km = 0.15
  const ipc = 2.8
  const fuel_consumption = fuelConsumption(combustion_consumption, fuel_selector["fuel_energy"])

  describe("Fuel Efficiency Calculations", () => {
    it("PASS: fuelEfficiency debería calcular correctamente", () => {
      const efficiency = fuelEfficiency(fuel_consumption)
      assert.strictEqual(typeof efficiency, "number")
      assert.ok(!isNaN(efficiency), "La eficiencia debería ser un número válido");
    })

    it("FAIL: fuelEfficiency debería fallar con consumo negativo", () => {
      assert.throws(
        () => fuelEfficiency(-1),
        Error,
        "Debería lanzar error con consumo negativo"
      );
    });

    it("SKIPPED: test de eficiencia en condiciones extremas", (t) => {
      t.skip("Test de condiciones extremas omitido")
      const extremeEfficiency = fuelEfficiency(0.0001)
      assert.ok(extremeEfficiency > 0)
    })
  })

  describe("Cost per Kilometer Calculations", () => {
    it("PASS: fuelCostKm debería calcular costo por km", () => {
      const cost = fuelCostKm(fuel_selector.fuel_price, fuel_consumption);
      assert.strictEqual(typeof cost, "number")
      assert.ok(cost > 0, "El costo debería ser positivo")
    })

    it("FAIL: fuelCostKm debería fallar con precio cero", () => {
      assert.throws(
        () => fuelCostKm(0, fuel_consumption),
        Error,
        "Debería validar precio mayor a cero"
      )
    })

    it("CANCELLED: test de costo con diferentes divisas", (t) => {
      if (process.env.MULTI_CURRENCY !== 'true') {
        t.skip("Test de múltiples divisas cancelado")
      }
      const costUSD = fuelCostKm(3.5, fuel_consumption)
      assert.ok(costUSD > 0);
    })
  })

  describe("Energy and Emission Calculations", () => {
    it("PASS: energyKm debería calcular energía por kilometro", () => {
      const energy = energyKm(combustion_consumption)
      assert.strictEqual(typeof energy, "number")
      assert.ok(energy > 0, "La energía debería ser positiva")
    })

    it("PASS: emisionKm debería calcular emisiones por km", () => {
      const energy_km = energyKm(combustion_consumption)
      const emissions = emisionKm(fuel_selector.emision_factor, energy_km)
      assert.strictEqual(typeof emissions, "number")
      assert.ok(emissions >= 0, "Las emisiones no deberían ser negativas")
    })

    it("FAIL: emisionKm debería fallar con factor de emisión negativo", () => {
      const energy_km = energyKm(combustion_consumption);
      assert.throws(
        () => emisionKm(-10, energy_km),
        Error,
        "Debería validar factor de emisión positivo"
      )
    })
  })

  describe("Energy Savings and Environmental Impact", () => {
    it("PASS: savedEnergy debería calcular energía ahorrada", () => {
      const saved = savedEnergy(combustion_consumption, electrical_consumption, annual_use);
      assert.strictEqual(typeof saved, "number")
    })

    it("PASS: avoidedEmissions debería calcular emisiones evitadas", () => {
      const energy_km = energyKm(combustion_consumption)
      const emision_km = emisionKm(fuel_selector.emision_factor, energy_km)
      const avoided = avoidedEmissions(emision_km, annual_use)
      assert.strictEqual(typeof avoided, "number")
      assert.ok(avoided >= 0, "Las emisiones evitadas no deberían ser negativas")
    })

    it("FAIL: savedEnergy debería fallar con uso anual negativo", () => {
      assert.throws(
        () => savedEnergy(combustion_consumption, electrical_consumption, -1000),
        Error,
        "Debería validar uso anual positivo"
      )
    })

    it("SKIPPED: test de ahorros con diferentes eficiencias", (t) => {
      t.skip("Test de múltiples escenarios de eficiencia omitido")
      const highEfficiencySave = savedEnergy(0.5, electrical_consumption, annual_use);
      assert.ok(highEfficiencySave >= 0)
    })
  })

  describe("Economic Calculations", () => {
    const fuel_cost_km = fuelCostKm(fuel_selector.fuel_price, fuel_consumption);

    it("PASS: monthlySavings debería calcular ahorro mensual", () => {
      const savings = monthlySavings(fuel_cost_km, cost_electrical_km, annual_use);
      assert.strictEqual(typeof savings, "number")
    })

    it("PASS: annualSavings debería calcular ahorro anual ajustado", () => {
      const monthly_savings = monthlySavings(fuel_cost_km, cost_electrical_km, annual_use)
      const annual_savings = annualSavings(monthly_savings, ipc)
      assert.strictEqual(typeof annual_savings, "number")
    })

    it("FAIL: monthlySavings debería fallar con costos negativos", () => {
      assert.throws(
        () => monthlySavings(-1, cost_electrical_km, annual_use),
        Error,
        "Debería validar costos no negativos"
      )
    })

    it("CANCELLED: test de ahorros en escenario inflacionario alto", (t) => {
      if (process.env.HIGH_INFLATION !== 'true') {
        t.skip("Test de alta inflación cancelado")
      }
      const highIPCSavings = annualSavings(1000, 15.5)
      assert.ok(highIPCSavings > 0)
    })
  })

  describe("Tree Equivalent Calculations", () => {
    const avoided_emissions = 2500 // kg CO2

    it("PASS: youngTree debería calcular árboles jóvenes equivalentes", () => {
      const trees = youngTree(avoided_emissions)
      assert.strictEqual(typeof trees, "number")
      assert.ok(trees >= 0, "El número de árboles no debería ser negativo")
    })

    it("PASS: oldTree debería calcular árboles maduros equivalentes", () => {
      const trees = oldTree(avoided_emissions)
      assert.strictEqual(typeof trees, "number")
      assert.ok(trees >= 0, "El número de árboles no debería ser negativo")
    })

    it("FAIL: youngTree debería fallar con emisiones negativas", () => {
      assert.throws(
        () => youngTree(-100),
        Error,
        "Debería validar emisiones no negativas"
      )
    })

    it("SKIPPED: test comparativo de tipos de árbol", (t) => {
      t.skip("Test comparativo de capacidad de absorción omitido")
      const young = youngTree(1000)
      const old = oldTree(1000)
      assert.ok(young !== old)
    })
  })

  describe("Hydrogen Production Calculations", () => {
    it("PASS: energyH2Cylinders debería calcular energía de cilindros", () => {
      const energy = energyH2Cylinders(1)
      assert.strictEqual(typeof energy, "number")
      assert.ok(energy > 0, "La energía debería ser positiva")
    })

    it("PASS: energyH2LowPresure debería calcular energía a baja presión", () => {
      const energy_cylinders = energyH2Cylinders(1)
      const energy_low = energyH2LowPresure(energy_cylinders)
      assert.strictEqual(typeof energy_low, "number")
    })

    it("PASS: energyConsumed debería calcular energía consumida", () => {
      const energy_h2 = energyH2LowPresure(energyH2Cylinders(1));
      const consumed = energyConsumed(energy_h2)
      assert.strictEqual(typeof consumed, "number")
    })

    it("PASS: hydrogenMass debería calcular masa de hidrógeno", () => {
      const energy_h2 = energyH2LowPresure(energyH2Cylinders(1))
      const mass = hydrogenMass(energy_h2)
      assert.strictEqual(typeof mass, "number")
      assert.ok(mass >= 0, "La masa no debería ser negativa")
    })

    it("PASS: litersRequired debería calcular litros necesarios", () => {
      const mass = hydrogenMass(energyH2LowPresure(energyH2Cylinders(1)))
      const liters = litersRequired(mass)
      assert.strictEqual(typeof liters, "number")
      assert.ok(liters >= 0, "Los litros no deberían ser negativos")
    })

    it("FAIL: energyH2Cylinders debería fallar con cilindros negativos", () => {
      assert.throws(
        () => energyH2Cylinders(-1),
        Error,
        "Debería validar número positivo de cilindros"
      )
    })

    it("CANCELLED: test de producción a escala industrial", (t) => {
      if (process.env.INDUSTRIAL_SCALE !== 'true') {
        t.skip("Test de escala industrial cancelado")
      }
      const industrialEnergy = energyH2Cylinders(10000)
      assert.ok(industrialEnergy > 1000000)
    });
  })

  describe("Integrated Flow Test", () => {
    it("PASS: flujo completo de cálculo ambiental", () => {
      // Usando las variables ya definidas de tus tests
      const fuel_efficiency = fuelEfficiency(fuel_consumption)
      const fuel_cost_km = fuelCostKm(fuel_selector.fuel_price, fuel_consumption)
      const energy_km = energyKm(combustion_consumption)
      const emision_km = emisionKm(fuel_selector.emision_factor, energy_km)
      const saved_energy = savedEnergy(combustion_consumption, electrical_consumption, annual_use)
      const avoided_emissions = avoidedEmissions(emision_km, annual_use)
      const monthly_savings = monthlySavings(fuel_cost_km, cost_electrical_km, annual_use)
      const annual_savings = annualSavings(monthly_savings, ipc)
      const young_tree = youngTree(avoided_emissions)
      const old_tree = oldTree(avoided_emissions)
      const energy_H2_cylinders = energyH2Cylinders(1)
      const energy_H2_low_presure = energyH2LowPresure(energy_H2_cylinders)
      const energy_consumed = energyConsumed(energy_H2_low_presure)
      const hydrogen_mass = hydrogenMass(energy_H2_low_presure)
      const liters_required = litersRequired(hydrogen_mass)

      // Verificaciones de tipos
      assert.strictEqual(typeof fuel_efficiency, "number")
      assert.strictEqual(typeof annual_savings, "number")
      assert.strictEqual(typeof young_tree, "number")
      assert.strictEqual(typeof liters_required, "number")
    })

    it("FAIL: flujo con datos inválidos debería fallar", () => {
      assert.throws(
        () => {
          fuelCostKm(-100, fuel_consumption);// Precio negativo
        },
        Error,
        "Debería detectar datos inválidos en la cadena"
      )
    })

    it("SKIPPED: test de flujo con múltiples configuraciones", (t) => {
      t.skip("Test de múltiples configuraciones omitido")
      const configs = [
        { power: 50, distance: 100, fuel: "gasoline" },
        { power: 100, distance: 200, fuel: "diesel" }
      ];
      configs.forEach(config => {
        const elec = electricalConsumption(config.power, config.distance)
        assert.ok(elec > 0)
      })
    })
  })

  describe("Edge Cases and Validation", () => {
    it("PASS: debería manejar valores cero apropiadamente", () => {
      const zeroElectrical = electricalConsumption(0, 200)
      assert.strictEqual(typeof zeroElectrical, "number")
      
      const minimalEmission = emisionKm(0.001, 0.001)
      assert.ok(minimalEmission >= 0)
    })

    it("FAIL: debería rechazar valores no numéricos", () => {
      assert.throws(
        () => electricalConsumption("invalid", 200),
        Error,
        "Debería validar tipos de datos"
      )
    })

    it("CANCELLED: test de rendimiento con grandes volúmenes", (t) => {
      if (process.env.PERFORMANCE_TEST !== 'true') {
        t.skip("Test de rendimiento cancelado")
      }
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        electricalConsumption(i, i * 2)
      }
      const duration = Date.now() - start
      assert.ok(duration < 1000, "Cálculos deberían ser eficientes")
    })
  })
})

// Tests finales para mostrar todos los tipos de resultado
describe("Final Result Demonstration", () => {
  it("PASS: demostración de test exitoso", () => {
    const result = tiMonth(1.5);
    assert.strictEqual(typeof result, "number")
    assert.ok(result > 0)
  })

  it("FAIL: demostración de test fallido", () => {
    // Este test falla intencionalmente para mostrar el resultado FAIL
    assert.throws(
      () => fuelEnergySelector("invalid_fuel_type"),
      Error,
      "Debería fallar con tipo de combustible inválido"
    )
  })

  it("SKIPPED: test omitido para demostración", (t) => {
    t.skip("Este test está omitido para demostrar SKIPPED")
    assert.strictEqual(1, 1)
  })

  it("CANCELLED: test cancelado para demostración", (t) => {
    if (process.env.DEMO_MODE !== 'true') {
      t.skip("Test cancelado porque DEMO_MODE no está activo")
    }
    assert.ok(true, "Este test solo corre en modo demo")
  })
})