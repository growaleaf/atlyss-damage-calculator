// ATLYSS weapon/skill damage projection, from atlyss.wiki.gg's own documented formulas
// (fetched directly 2026-10-21 — see README for the verbatim quotes and page URLs):
// 1) Weapon damage floor/ceiling, "Game Mechanics" page, Damage Scaling table:
//    Floor = Base Damage Floor + (scaling stat * 0.16)
//    Ceiling = Base Damage Ceiling + (scaling stat * 0.24)
//    Strength weapons scale on Attack Power, Dexterity weapons on Dex Power, Mind weapons on
//    Magic Power. No diminishing returns; decimals are rounded down to the nearest integer; the
//    result cannot exceed the weapon's own documented max damage range (player-typed cap here,
//    never a shipped default — see README on why no weapon's cap is hardcoded).
// 2) Skill damage, "Skill" page (self-marked a stub as of the fetch date above):
//    Minimum = Base Damage + (power stat * 0.36), Maximum = Minimum + 3.
//    Vitality-scaling skills (e.g. Siphon) use max HP as their "power" value instead of a stat.
//    The Game Mechanics page's own Damage Scaling table lists a "Skills" row using 0.36 for BOTH
//    floor and ceiling, which does not match the Skill page's "max = min + 3" wording — a direct
//    disagreement between two live pages on the same wiki. This calculator ships the Skill page's
//    own explicit formula for skills, since the charter and the Skill page both source it
//    specifically to skill damage; see README for the conflicting table text, quoted in full.
(function (root) {
  "use strict";

  function isFiniteNonNegative(n) {
    return typeof n === "number" && isFinite(n) && n >= 0;
  }

  function weaponDamage(input) {
    var baseFloor = input.baseFloor;
    var baseCeiling = input.baseCeiling;
    var statValue = input.statValue;
    var capValue = input.capValue;

    if (!isFiniteNonNegative(baseFloor) || !isFiniteNonNegative(baseCeiling) || !isFiniteNonNegative(statValue)) {
      return null;
    }

    var floorRaw = baseFloor + statValue * 0.16;
    var ceilingRaw = baseCeiling + statValue * 0.24;
    var floorVal = Math.floor(floorRaw);
    var ceilingVal = Math.floor(ceilingRaw);

    var capped = false;
    if (isFiniteNonNegative(capValue) && capValue > 0) {
      if (floorVal > capValue) { floorVal = capValue; capped = true; }
      if (ceilingVal > capValue) { ceilingVal = capValue; capped = true; }
    }

    return { floor: floorVal, ceiling: ceilingVal, capped: capped };
  }

  function skillDamage(input) {
    var baseDamage = input.baseDamage;
    var power = input.power;

    if (!isFiniteNonNegative(baseDamage) || !isFiniteNonNegative(power)) {
      return null;
    }

    var minRaw = baseDamage + power * 0.36;
    var minVal = Math.floor(minRaw);
    var maxVal = minVal + 3;

    return { min: minVal, max: maxVal };
  }

  var API = {
    weaponDamage: weaponDamage,
    skillDamage: skillDamage
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  } else {
    root.ATLYSSCALC = API;
  }
})(typeof window !== "undefined" ? window : this);
