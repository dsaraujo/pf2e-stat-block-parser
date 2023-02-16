# Pathfinder 2E Statblock Parser

A simple FoundryVTT module that allows GMs to parse the statblocks of Pathfinder NPCs so they can quickly create NPCs. It is based on the amazing Starfinder Parser by Deepflame at https://gitlab.com/TimToxopeus/sfrpg-statblock-parser, and with code by darrenan in his PF2CreatureParser Extension for Fantasy Grounds.

## Use

To use simply go to the actors tab in FoundryVTT, and click the Parse Statblock button at the bottom. Paste in the statblock text, and click ok.

The main focus of this module is to support Paizo-style statblocks, this means you must include the category headers like defense, offense, statistics, etc. However, to some extent, HeroLab statblocks are also supported, as they are very similar to Paizo-style. Finally, there is a basic implementation for PCGen XML and VTTES JSON exported characters.

An example Paizo-style statblock:
~~~
EXAMPLE BEING
CREATURE 0
RARE CE TINY HUMAN
Perception +1
Languages Common, Necril
Skills Acrobatics +1, Stealth +2
Str -2, Dex +1, Con +3, Int -2, Wis +1, Cha +2
AC 12; Fort +1, Ref +2, Will +3
HP 25, negative healing; Immunities death effects, disease, paralyzed, poison, unconscious; Weaknesses fire 1, cold 2
Speed 5 feet, fly 10 feet
Melee [one-action] finger poke +1 (finesse, agile), Damage 1d6 negative
Melee [two-actions] finger stab +2 (finesse, agile), Damage 1d6 fire
Ranged [three-actions] finger throw +3 (finesse, sweep), Damage 1d6 good
Divine Innate Spells DC 42, attack +32; 9th divine wrath, prismatic sphere; 4th confusion (at will), dimension door (at will);
Example Ability [two-actions] (concentrate, divine, polymorph, transmutation)
The Example Being can take the appearance of any other creature.

Another Example Ability [three-actions] (concentrate, divine, polymorph, transmutation)
This ability makes the Example Being nigh invulnerable.

~~~

Also important to note is that official PDFs usually use a long dash hyphen for the stats (like STR –2), while the parser expects a regular minus (STR -2).

