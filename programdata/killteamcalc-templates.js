/**
 * Kill Team shooting probability calculator
 * (c)2023 Sándor Preszter - https://www.gnu.org/licenses/gpl-3.0.html
 * 
 * @author	Sándor Preszter <preszter.sandor@gmail.com>
 * @version	1.00
 * @since	2023-02-09 
 */
// Order of values: a, bsx, damageHit, damageCrit, apx, lethalx, px, mwx, splash, balanced, ceaseless, relentless, rending
var weaponTemplateArray = new Array();
weaponTemplateArray["Lasgun"] = new weaponProfileObject(4, 4, 2, 3, 0, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Boltgun"] = new weaponProfileObject(4, 3, 3, 4, 0, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Heavy Bolter"] = new weaponProfileObject(5, 3, 4, 5, 0, 6, 1, 0, 0, false, false, false, false);
weaponTemplateArray["Long Las (Sniper)"] = new weaponProfileObject(4, 2, 3, 3, 0, 6, 0, 3, 0, false, false, false, false);
weaponTemplateArray["Flamer"] = new weaponProfileObject(5, 2, 2, 2, 0, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Meltagun"] = new weaponProfileObject(4, 4, 6, 3, 2, 6, 0, 4, 0, false, false, false, false);
weaponTemplateArray["Plasma"] = new weaponProfileObject(4, 4, 5, 6, 1, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Frag Grenade"] = new weaponProfileObject(4, 3, 2, 3, 0, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Krak Grenade"] = new weaponProfileObject(4, 3, 4, 5, 1, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Rotor Cannon"] = new weaponProfileObject(6, 4, 3, 4, 0, 6, 0, 0, 0, false, false, true, false);
weaponTemplateArray["Pulse Carbine"] = new weaponProfileObject(4, 4, 4, 5, 0, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Ion Rifle"] = new weaponProfileObject(5, 4, 4, 5, 0, 6, 1, 0, 0, false, false, false, false);
weaponTemplateArray["Ion Rifle Hot"] = new weaponProfileObject(5, 4, 5, 6, 1, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Rail Rifle"] = new weaponProfileObject(4, 4, 4, 4, 1, 5, 0, 2, 0, false, false, false, false);
weaponTemplateArray["Shuriken Pistol"] = new weaponProfileObject(4, 3, 3, 4, 0, 6, 0, 0, 0, false, false, false, true);
weaponTemplateArray["Missile Launcher - Krak"] = new weaponProfileObject(4, 3, 5, 7, 1, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Reaper Chaincannon"] = new weaponProfileObject(6, 3, 3, 5, 0, 6, 0, 0, 0, false, true, false, false);
weaponTemplateArray["Scoped Big Shoota"] = new weaponProfileObject(6, 2, 2, 2, 0, 6, 0, 2, 0, false, false, false, false);
weaponTemplateArray["Gauss Blaster"] = new weaponProfileObject(4, 3, 4, 5, 1, 6, 0, 0, 0, false, false, false, false);
weaponTemplateArray["Tesla Carbine"] = new weaponProfileObject(5, 3, 3, 3, 0, 6, 0, 0, 1, false, false, false, false);
weaponTemplateArray["Synaptic Disintegrator"] = new weaponProfileObject(4, 2, 4, 4, 1, 6, 0, 1, 0, false, false, false, false);
