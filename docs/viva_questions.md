# Viva Questions — Experiment No. 1

**Study of Household / Domestic Refrigerator**
Refrigeration & Air Conditioning Lab — Prof. Udhhav Nimbalkar

---

### 1. What is a vapour compression refrigeration cycle?

A closed cycle in which a refrigerant is alternately compressed and expanded, changing phase
between liquid and vapour, so that it absorbs latent heat in the evaporator at low pressure and
rejects it in the condenser at high pressure. The four processes are:

| Process | Component | Nature |
| ------- | --------- | ------ |
| 1 → 2 | Compressor | Isentropic compression (work input) |
| 2 → 3 | Condenser | Constant-pressure heat rejection |
| 3 → 4 | Capillary tube | Throttling at constant enthalpy |
| 4 → 1 | Evaporator | Constant-pressure heat absorption |

### 2. What is the function of the capillary tube?

It is the throttling (expansion) device. It reduces the pressure of the liquid refrigerant from
condenser pressure to evaporator pressure, and thereby its temperature, and it meters the flow of
refrigerant into the evaporator. It is a plain copper tube of 0.6–1.0 mm bore and 2–4 m length,
with no moving parts, so it needs no maintenance — which is why it is used in domestic units
instead of a thermostatic expansion valve.

### 3. Explain cut-in and cut-out temperature.

- **Cut-out** — the temperature at which the thermostat contacts open and the compressor stops
  (about 2 °C at the sensing point).
- **Cut-in** — the temperature at which the contacts close again and the compressor restarts
  (about 8 °C).
- **Differential** = cut-in − cut-out ≈ 6 °C.

A large differential gives fewer but longer runs; too small a differential causes rapid
short-cycling, which overheats the motor and wastes energy.

### 4. What is the COP of a refrigerator?

Coefficient of Performance = refrigerating effect / work input

```
COP = (h₁ − h₄) / (h₂ − h₁)
```

It is a dimensionless ratio and is greater than one for a refrigerator; a domestic unit typically
achieves 2 to 3. Unlike efficiency, COP can exceed 100 % because heat is *moved*, not produced.

### 5. Why is R-134a used instead of R-12?

R-12 (dichlorodifluoromethane, a CFC) contains chlorine, which destroys stratospheric ozone; it was
phased out under the Montreal Protocol. R-134a (tetrafluoroethane, an HFC) is chlorine-free, so its
Ozone Depletion Potential is zero. It is non-toxic, non-flammable and has thermodynamic properties
close to R-12, so existing designs needed only minor changes — mainly a change of lubricating oil
from mineral oil to polyol-ester, because R-134a is not miscible with mineral oil.

### 6. What is frosting and how is it prevented?

Frosting is the deposition of ice on the evaporator surface from moisture in the cabinet air. Frost
is a thermal insulator: a 3 mm layer noticeably reduces heat transfer, so running time and power
consumption rise while cabinet temperature rises too. It is removed by defrosting:

1. **Manual** — thermostat set to DEFROST or unit unplugged; frost melts by cabinet heat.
2. **Semi-automatic** — a push button opens the thermostat contacts; cooling resumes automatically
   at about 4 °C.
3. **Automatic / timer** — a timer stops the compressor every 6–12 hours and energises an electric
   heater near the evaporator for 15–25 minutes.

It is minimised by covering all liquids, storing vegetables in the crisper, and limiting door
openings.

### 7. What is the range of household refrigerator capacity?

Gross volume is commonly 165 to 300 litres, corresponding to a refrigerating capacity of roughly
0.1 to 0.3 tonnes of refrigeration (1 TR = 3.5 kW), with a compressor power input of about
100–200 W.

---

## Additional questions

**Why is the condenser placed at the back of the cabinet?**
It rejects heat by natural convection; the rear position gives a chimney effect and keeps the hot
surface away from the user. It needs 75–100 mm clearance from the wall.

**What is the function of the drier / strainer?**
It absorbs any moisture left in the system (moisture would freeze at the capillary inlet and choke
it) and strains out solid particles such as scale and solder flux.

**Why must the compressor not be restarted immediately?**
Just after switching off, the discharge side is still at high pressure. A hermetic motor has low
starting torque, so it cannot start against that pressure — it stalls, draws locked-rotor current
and trips the overload protector. Wait at least 5 minutes for the pressures to equalise.

**What is the purpose of the overload protector and relay?**
The relay connects the starting winding only during starting; the overload protector (a bimetal
switch in series with the motor) breaks the circuit on excessive current or shell temperature.

**Why is the evaporator placed at the top of the cabinet?**
Air cooled by the evaporator becomes denser and sinks, while warmer air rises to the coil. This
natural convection circulates air through the whole cabinet without a fan.
