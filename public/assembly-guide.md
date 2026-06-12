# Manufacturing

## 3D Print
* **Material:** ECO-ABS
* **Print settings (for MPC Lab printers):** High quality, infill 20%, generate support = only touching buildplate, build plate adhesion type = none

### Parts:
* **Body**

  <img src="assets/1_3D_print_body.png" width="500">

* **Camera Mount**

  <img src="assets/2_3D_print_camera_mount.png" width="500">

* **Harness Lock** (must print 1 of each side, they are NOT symmetric)

  <img src="assets/3_3D_print_harness_lock.png" width="500">

* **Motor box top plate (4x)** - recommended to print upside down

  <img src="assets/4_3D_print_top_plate.png" width="500">

* **Motor box bottom plate (4x)**

  <img src="assets/5_3D_print_bottom_plate.png" width="500">

* **Lid** - recommended to print upside down

  <img src="assets/6_3D_print_lid.png" width="500">

* **GPS fastener**

  <img src="assets/7_3D_print_gps_fastener.png" width="500">

* **Wheel-to-motor adapter (4x)** - recommended to upside down

  <img src="assets/8_3D_print_motor_adapter.png" width="500">

* **Wheel washer (4x)**

  <img src="assets/9_3D_print_washer.png" width="500">

## Water Jet
* **Aluminum plate (4x)**

  <img src="assets/10_water_jet.png" width="500">

# Assembly
**Note:** Most bolt lengths are suggestions. The motor boxes MUST use M2.5x18 where indicated.

## Lid + GPS + Arduino
* Screw 4 M3x5mm M-F standoffs into the underside of the lid and secure the GPS board with 4 M3x4 bolts. Orient so that screw connection to GPS points towards center.

  <img src="assets/11_lid_1.jpg" width="500">

* Screw Arduino onto the underside of the lid with 4 M1.6x6 philips-head screws.

  <img src="assets/12_lid_2.jpg" width="500">

* Thread end of GPS antenna cable through the hole in the lid and connect to the board.

* Wind the cable around the circle on the top of the lid, place grounding plate over the coil.

  <img src="assets/13_lid_3.jpg" width="500">

* Place GPS antenna on top of the mounting plate and secure the GPS fastener (3D printed part) with 4 M2.5x10 philips-head screws. Note the fastener has a slot for the wire on the underside, so check orientation before screwing in.

  <img src="assets/14_lid_4.jpg" width="500">

* When ready, secure lid to body with 5 M3x8 bolts.

  <img src="assets/15_lid_5.jpg" width="500">

## POWER + CAN Harness
* Make an XT90-M pigtail (length ~ 16 cm) with 10 AWG wires (maybe could be smaller gauge? Google motor + wire current limits). Solder to the underside of the PDB using the central +- holes. Also solder barrel connector (length ~16 cm) as shown:

  <img src="assets/16_wire_1.jpg" width="500">

>[!NOTE]
> The photos show XT60, which was later changed to XT90-S

* Solder 4 XTM-30 F pigtails to the PDB using the left/right side rows (I chose to not shorten them to have more margin of error, but you could cut them shorter to save space):

  <img src="assets/17_wire_2.jpg" width="500">

* Screw a M3 nut onto a M3x10mm M-F standoff. Repeat 4x. Screw standoffs into the holes in the bottom of the body.

  <img src="assets/18_wire_3.jpg" width="500">

* Secure the PDB with 4 M3x6 bolts. I routed the barrel jack around the outside and the XT90 underneath.

  <img src="assets/19_wire_4.jpg" width="500">

* Make 4 XT30 M-F extension cords by soldering XT30 F connectors onto XT30 M pigtails. Use heat shrink. Do not cut the pigtails. (4x)

  <img src="assets/20_wire_5.jpg" width="500">

* Crimp CAN harness JST F-F connectors using the ribbon cable, headers, header pins: 1 ~33 cm, 2 ~23 cm, 2 ~13 cm.

  <img src="assets/21_wire_6.jpg" width="500">

>[!WARNING]
> Pay attention to the direction you crimp on the connector. The GND wire (red) should always be on the right when plugged into the motor controller.

* The 2 shortest ribbon cables are the start/end of the CAN bus. One connects to the CAN termination, the other connects to the CAN-USB adapter using a JST M header and braided CAN cable (this cable is not strictly necessary, but gives more range of error for wire lengths. You could eliminate it with carefully measured ribbon cable lengths).

  <img src="assets/21_wire_7.jpg" width="500">

* Cut 4 ~6.5cm pieces of flexible conduit. Thread an XT30 extension cord through each one. Pick each conduit to be the front/rear left/right, and thread the CAN cables as follows:
  * The short cable attached to the CAN termination through the rear right (such that the CAN termination is on the same end as the XT30-M).
  * The short cable attached to the USB adapter through the rear left (such that the USB adapter is on the same end as the XT30-M).
  * One medium cable through the front left and rear left.
  * One medium cable through the front left and rear right.
  * The large cable through the front left and front right.
* Place M3 nuts into the slots in the body and secure the conduit with the harness locks (3D printed parts) with M3x12 bolts (such that all XT30-M are inside the vehicle body).

  <img src="assets/22_wire_8.jpg" width="500">

* Attach the air vent (no fan) usign M3x10 bolts and 4 nuts.
* Attach each XT30-M to the closest XT30-F from the PDB.

  <img src="assets/23_wire_9.jpg" width="500">

## Camera
* Install 2 M3x15 M-F standoffs in the camera mounting holes with an M3 nut between the camera and each standoff.

  <img src="assets/24_camera_1.jpg" width="500">

* Secure the camera to the camera mount (3D printed piece) using 2 M3x6 bolts.
* Plug the usbc-to-usba cable into the camera, thread through the hole in the camera mount/body, and place the camera mount on the body.

  <img src="assets/25_camera_2.jpg" width="500">

>[!NOTE]
> This hole was specifically designed for this cable. If you want to change cables, you may need to 3D print a new base.

* Place M3 nuts into the slots on the body, secure camera mount with 2 M3x12 bolts.
  
  <img src="assets/26_camera_3.jpg" width="500">

## Jetson + Cables
* Place Jetson in front of body with USB ports towards the center.
* Install USB fan near the Jetson with M3x18 bolts and M3 nuts, oriented so the nuts in the fan face the Jetson.
* Optional: cut, solder fan wire to be shorter.
* Install mesh + cover over fan.
* Install additional mesh + cover on the back right with M3x12 bolts and M3 nuts.
* Plug in lower level of cables: USB-C for GPS, USB-A for Arduino, barrel jack.

  <img src="assets/27_jetson_1.jpg" width="500">
  
* Plug in upper level of cables: USB-A for camera, USB-A for CAN-USB adapter.

  <img src="assets/28_jetson_2.jpg" width="500">

>[!WARNING]
> On the moteus CAN wire, GND is BLACK. On our ribbon cable, GND is RED. Make sure you plug in the CAN bus correctly.

* NOTE: the ports for the USB-A devices do not matter, but I have found the wire routing to the cleanest with:
  * Top left = camera
  * Top right = CAN
  * Bottom left = fan
  * Bottom right = arduino

  <img src="assets/29_jetson_3.jpg" width="500">

## Motor Box + Wheel (repeat 4x)
* Install 4 threaded inserts (M2.5xL2.5xD3.5) into the underside of the top plate.
  * Recommendation: screw a short M2.5 bolt into the threaded insert, then put the heat source on the screw instead of directly pressing on the insert. This prevents melted plastic from flowing up the threads and helps get a level insert.

  <img src="assets/30_motor_1.jpg" width="500">

* Place the aluminum plate inside the top plate (note orientation in picture).

  <img src="assets/31_motor_2.jpg" width="500">

* Secure the plate with 4 5mm M-F standoffs.

  <img src="assets/32_motor_3.jpg" width="500">

* Adhere sense magnet to the bottom of the shaft with super glue (recommend by hand, not with tweezers).

  <img src="assets/33_motor_4.jpg" width="500">

* Thread the motor wires through the holes in the top plate and secure motor to the aluminum plate with 4 M3x6 phillips-head screws. Phillips head chosen for lower profile than hex head.

  <img src="assets/34_motor_5.jpg" width="500">
    
  <img src="assets/35_motor_6.jpg" width="500">

* STOP: Complete “Set Moteus CAN Configuration” in Moteus Setup (below).
* Note which motor box you are currently assembling:
  * CAN ID 1 = FRONT RIGHT
  * CAN ID 2 = REAR RIGHT
  * CAN ID 3 = FRONT LEFT
  * CAN ID 4 = REAR RIGHT
* Solder the wires to the moteus board as shown:

  <img src="assets/36_motor_7.jpg" width="500">

  <img src="assets/37_motor_8.jpg" width="500">

* Plug in the power and CAN wires to the moteus board. It does not matter which ports you use.

  <img src="assets/38_motor_9.jpg" width="500">

* Insert 4 M2.5x18mm bolts into the bottom plate.

  <img src="assets/39_motor_10.jpg" width="500">

* Put 4 5mm F-F standoffs on the bolts.

  <img src="assets/40_motor_11.jpg" width="500">

* Put the moteus heat shield on the bolts as shown:

  <img src="assets/41_motor_12.jpg" width="500">

* Hold the moteus board on the bolts and screw/unscrew the bolts so there are just a few threads extending beyond the board as shown:

  <img src="assets/42_motor_13.jpg" width="500">

  <img src="assets/43_motor_14.jpg" width="500">

* Line up the two halves of the box, close, and tighten the bolts to secure. Make sure the tubing is secure.

  <img src="assets/44_motor_15.jpg" width="500">

* Insert 4 M3 nuts into the slots on the body.
* Use 4 M3x12 bolts to secure the motor box.
  * Note: if you need more/less conduit length for the motor box to comfortably reach the holes without strain, it is easier to adjust the body end rather than the motor box end.
    
  <img src="assets/45_motor_16.jpg" width="500">

  <img src="assets/46_motor_17.jpg" width="500">

* Place 3 M3 external tooth lock washers into the holes on the wheel-to-motor adapter, then secure to the motor with 3 M3x8 bolts.

  <img src="assets/47_motor_18.jpg" width="500">

* Place an M5 nut into the slot on the wheel-to-motor adapter. Press the wheel onto the adapter. Note: tire with sand scoops must be installed on the correct side.

  <img src="assets/48_motor_19.jpg" width="500">

* Place wheel washer (3D printed part) on the wheel, put one put 1 M5 external tooth lock washer inside the 3D printed washer, and secure with M5x20 bolt.

  <img src="assets/49_motor_20.jpg" width="500">

* Complete “Motor Calibration” in Moteus Setup (below).

* Celebrate!

  <img src="assets/50_motor_21.jpg" width="500">

## Recommended Additional Steps
* Put M3 threaded inserts in the lid mounting holes as shown.

  <img src="assets/56_extra_1.jpg" width="500">

* Use dual lock tape (shown) or velcro tape to help secure the battery, which may otherwise jostle around.

  <img src="assets/57_extra_2.jpg" width="500">

# Moteus Setup

## Set Moteus CAN Configuration
1. Have pip and python installed on whatever computer you’re using. Install the necessary packages.
   * Terminal command: `pip install moteus moteus_gui`
2. Plug the moteus board into your computer using the CAN-USB adapter and provide power from the wall-to-XT30 power supply that comes with the mjbots dev kit.
3. Terminal command: `python -m moteus_gui.tview -t #`
   * `#` is the moteus board ID, which is default 1 out of the package.
   * Launches tview GUIz.
4. Find `config/id/id`.

   <img src="assets/52_calibrate_1.png" width="500">

6. Change number to desired value, hit enter. Should see the command `1>conf set id.id #` appear in the tview terminal.
7. Close the current tview window.
8. Open a new tview window (step 3) with the new motor ID.
9. Use the tview terminal command `#>conf write` to make the change permanent. Should see `#>OK` in the tview terminal.
10. Find `config/motor_position/output/sign`.
11. Change the value according to this table:

| ID # | Value |
|---|---|
| 1, 2 | -1 (LUCI), +1 (SAPEM), NO CHANGE (LUCI SPORT) |
| 3, 4 | +1 (LUCI), -1 (SAPEM), NO CHANGE (LUCI SPORT) |

11. Use the tview terminal command `#>conf write` to make the change permanent.
12. Check: power moteus board off and back on again, close tview and launch a new window with the new ID. Should see all config changes and live telemetry data.

## Motor Calibration
* Note: can be performed once the car is assembled. Moteus CAN ID’s must be set beforehand.
* Make sure CAN adapter is connected to a computer (can be your laptop or the Jetson) and connected to the CAN bus (can have all moteus boards connected if ID’s are set).
* For the desired motor, unplug the XT30 extension cord from the PDB. Connect wall-to-XT30 supply to this motor.
* Terminal command: `python -m moteus.moteus_tool --target # --calibrate`
   * `#` = CAN ID of the moteus board you want to calibrate.
* Note: the motor will move!! I recommend having the vehicle on its side with the motor up. Hold it steady. If needed, emergency stop with Ctrl+C in the terminal.

  <img src="assets/53_calibrate_2.jpg" width="500">

* Should see “Calibration complete” and a .log file when calibration is complete. You don’t need to do anything with this file.

  <img src="assets/54_calibrate_3.png" width="500">

  <img src="assets/55_calibrate_4.png" width="500">

## Troubleshooting:
* Best results when wheel is on the motor, motor orientation is horizontal (car is on its side, wheels face up).
* Use the power supply, not battery power.
* Update your moteus packages – MJBots keeps changing the calibration routine.

---

<br>
<br>

```
╔═══════════════════════════════════════════╗
║  * * *  YOU SCROLLED ALL THE WAY?  WOAH!  ║
║                                           ║
║        H E R E   I S   A   G I F T        ║
╚═══════════════════════════════════════════╝

               ▄███▄
             ▄███████▄
            ███ ◉  ◉ ███
            ██    ▼    ██
            ████▓▓▓████
            ██▓▓▓▓▓▓▓██     <- legendary beard
           ████▓▓▓▓▓████
       ██  ██  █████████  ██
      ████ ████████████████ ████
       ██  ██  █████████  ██
            ██       ██
            ██       ██
          ████       ████

                   ✦
             ╔══════════╗
             ║ ★  $  ★  ║
             ║  $ ☆ $   ║
             ║ ★  $  ★  ║
             ╠══════════╣
             ╚══════════╝

    +9999 GOLD     XP: ████████████ MAX

    >> ACHIEVEMENT UNLOCKED: "THE PATIENT ONE" <<
```
