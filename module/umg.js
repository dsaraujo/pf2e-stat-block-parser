export class SBUniversalMonsterRules {}

SBUniversalMonsterRules.specialAbilities = [
    {
      name: "Alien Presence",
      abilityType: "Ex or Su",
      source: "Alien Archive 2 pg. 148",
      description: "The creature’s mere presence can have deleterious effects for those nearby. It can activate this ability as part of the action of making an attack or as a move action, but it can activate it only once per round. It usually has a range of 30 feet. This aura functions as frightful presence, but instead of imposing the shaken condition on creatures that fail their Will saves, it imposes the listed condition. The duration is 5d6 rounds unless the ability says otherwise. Once an opponent has been exposed to a creature’s alien presence (whether or not the opponent succeeds at its saving throw), it cannot be affected by the same creature’s alien presence for 24 hours. This is an emotion, fear, mind-affecting, and sensedependent effect.",
      formatKey: "Aura",
      format: "alien presence (240 ft., DC 25, sickened 2d4 rounds).",
      guidelines: ""
    },
    {
      name: "Amorphous",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 148, Alien Archive pg. 152",
      description: "The creature’s body is malleable and shapeless. It does not take double damage from critical hits, but it is affected by critical hit effects normally.",
      formatKey: "Defensive Abilities",
      format: "amorphous.",
      guidelines: ""
    },
    {
      name: "Amphibious",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 150, Alien Archive pg. 152, Alien Archive 2 pg. 149",
      description: "The creature has the aquatic subtype or water breathing, but it can breathe air and survive on land.",
      formatKey: "Other Abilities",
      format: "amphibious.",
      guidelines: ""
    },
    {
      name: "Attach",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 150, Alien Archive 2 pg. 149, Alien Archive pg. 152",
      description: "The creature can attempt a special attack against KAC as a standard action. If it succeeds, it deals no damage, but the creature adheres to its target. Once attached, the creature gains a +4 bonus to its AC (from cover) and a +2 circumstance bonus to melee attacks, but it can attack only the creature to which it is attached. An attached creature can’t move on its own (though it moves with its target), take actions that require two hands, or make attacks of opportunity. An attached creature can be removed with a successful Strength check (DC = 10 + 1-1/2 × the creature’s CR) made as a move action, or it can remove itself from its target as a move action.",
      formatKey: "Melee",
      format: "attach +6.",
      guidelines: ""
    },
    {
      name: "Aura",
      abilityType: "Ex, Sp, or Su",
      source: "Alien Archive 3 pg. 150, Alien Archive pg. 152, Alien Archive 2 pg. 149",
      description: "Unless an aura says otherwise, a target is affected by an aura automatically, with no action required on the creature’s part, whenever the target is within the aura’s listed range (either when the target enters the aura on its turn or when it begins its turn in the aura, whichever comes first). If the aura deals damage, it damages a target only the first time the target is in the aura each round, regardless of how many times within the round the target enters and leaves the aura. A creature can suppress its aura for 1 round as a move action unless noted otherwise.",
      formatKey: "Aura",
      format: "radiation (30 ft., Fortitude DC 17); if additional information is needed, the aura also has an entry in Special Abilities.",
      guidelines: ""
    },
    {
      name: "Blindsense",
      abilityType: "Ex",
      source: "Alien Archive pg. 152",
      description: "The creature has a specific imprecise nonvisual sense that operates effectively without vision. This specific sense is indicated in parentheses. For more information on blindsense, see page 262 of the Starfinder Core Rulebook.",
      formatKey: "Senses",
      format: "blindsense (vibration) 60 ft.",
      guidelines: "Blindsense usually has a range of 60 feet."
    },
    {
      name: "Blindsight",
      abilityType: "Ex",
      source: "Alien Archive pg. 152",
      description: "Blindsight is a more precise version of blindsense. This ability operates out to a specified range. A creature with blindsight typically perceives using a specific type of sense, indicated in parentheses. See page 262 of the Starfinder Core Rulebook for more information.",
      formatKey: "Senses",
      format: "blindsight (life) 60 ft.",
      guidelines: "Blindsight usually has a range of 60 feet."
    },
    {
      name: "Breath Weapon",
      abilityType: "Su",
      source: "Alien Archive 3 pg. 150, Alien Archive pg. 152, Alien Archive 2 pg. 149",
      description: "As a standard action, the creature can exhale a cone or line of energy or another magical effect. A breath weapon attack usually deals damage, and it is often energy-based. A breath weapon usually allows a target to attempt a Reflex saving throw for half damage, though some breath weapons require a successful Fortitude or Will save instead. A creature is immune to its own breath weapon and the breath weapons of others of its kind unless otherwise noted. Each breath weapon also indicates how often it can be used.",
      formatKey: "Offensive Abilities",
      format: "breath weapon (60-ft. cone, 8d6 F, Reflex DC 18 half, usable every 1d4 rounds); if the breath weapon has more complicated effects, it also has an entry in Special Abilities.",
      guidelines: "1d6 damage + 1d6 per CR, usable once every 1d4 rounds. A cone is usually 30 feet long, increasing by 10 feet for every size category above Medium or decreasing by 5 feet for every size category below Medium. A line is twice as long as a cone would be."
    },
    {
      name: "Change Shape",
      abilityType: "Su",
      source: "Alien Archive 2 pg. 149, Alien Archive pg. 152",
      description: "The creature has the ability to assume the appearance of a specific creature or type of creature, but it retains most of its own physical qualities. If the form assumed has any of the following abilities, the creature gains them while in that form: blindsight (scent), darkvision, low-light vision, and swim 30 feet. The creature can retain its own breathing ability, or it can assume the ability to breathe in any environment the assumed shape can breathe in (including the no breath ability, which enables it to survive in the vacuum of space). If the ability does not specify what the creature can change shape into, it can assume the form of any creature of the humanoid type, but it can’t mimic a specific humanoid. Change shape grants a +10 bonus to Disguise checks to appear as a creature of the type and subtype of the new form, and the DC of the creature’s Disguise check is not modified as a result of altering major features or disguising itself as a different race or creature type.\nA creature can assume a form that is one size category smaller or larger than its original form and become that size. Unless otherwise stated, it can remain in an alternate form indefinitely. Some creatures can transform into unique forms with special modifiers and abilities. These creatures adjust their ability scores, as noted in their description.",
      formatKey: "Other Abilities",
      format: "change shape (humanoid); creatures with a unique form also have an entry in Special Abilities.",
      guidelines: ""
    },
    {
      name: "Compression",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 150, Alien Archive pg. 153, Alien Archive 2 pg. 149",
      description: "The creature can move through an area as small as one-quarter of its space without squeezing or one-eighth its space when squeezing.",
      formatKey: "Other Abilities",
      format: "compression.",
      guidelines: ""
    },
    {
      name: "Construct Immunities",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 150, Alien Archive 2 pg. 149, Alien Archive pg. 153",
      description: "Constructs are immune to the following effects, unless the effect specifies that it works against constructs.\nBleed, death effects, disease, mind-affecting effects, necromancy effects, paralysis, poison, sleep, and stunning.\nAbility damage, ability drain, energy drain, exhaustion, fatigue, negative levels, and nonlethal damage.\nAny effect that requires a Fortitude save (unless the effect works on objects or is harmless).",
      formatKey: "Immunities",
      format: "construct immunities.",
      guidelines: ""
    },
    {
      name: "Create Darkness",
      abilityType: "Su",
      source: "Alien Archive pg. 153",
      description: "As a standard action, the creature can create a 20-foot-radius area of darkness centered on itself, which negates the effects of all nonmagical light sources in that area. This darkness lasts for a number of minutes equal to the creature’s CR, and the creature can dismiss the effect as a standard action. The darkness doesn’t move with the creature. Unless otherwise noted, any magic source of light can increase the light level in the area as normal.",
      formatKey: "Offensive Abilities",
      format: "create darkness.",
      guidelines: ""
    },
    {
      name: "Crush",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 151, Alien Archive pg. 153, Alien Archive 2 pg. 149",
      description: "When ending a flying or jumping movement, the creature can land on targets that are at least three size categories smaller than itself. Targets are automatically knocked prone, take the listed damage, and are pinned. Each crushed target can attempt to escape the pin normally on its turn, and the pin ends automatically if the crushing creature moves out of the target’s square. A crushed target does not take damage from the crush more than once, unless the crushing creature moves fully off that creature and then back onto it.",
      formatKey: "Offensive Abilities",
      format: "crush (4d6+8 B).",
      guidelines: "Use the same damage amount as for the creature’s standard melee attack."
    },
    {
      name: "Darkvision",
      abilityType: "Ex or Su",
      source: "Alien Archive pg. 153",
      description: "The creature can see out to the listed range with no light source at all. See page 263 of the Starfinder Core Rulebook.",
      formatKey: "Senses",
      format: "darkvision 60 ft.",
      guidelines: "Darkvision has a range of 60 feet for most creatures or 120 feet in exceptional cases."
    },
    {
      name: "Dependency",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 150, Alien Archive pg. 153",
      description: "The creature is dependent on a substance, a sense, or something else to either survive or function normally. If the creature is dependent on something to live (such as water), it can survive without that thing for a number of minutes equal to 5 times its Constitution modifier. Beyond this limit, the creature runs the risk of negative effects, such as suffocation or death. A creature that is dependent on something to function normally (such as a creature with blindsight and no visual sense) usually gains a negative condition when it loses that thing.",
      formatKey: "Weaknesses",
      format: "blindsight dependency.",
      guidelines: ""
    },
    {
      name: "Detect Alignment",
      abilityType: "Sp or Su",
      source: "Alien Archive 3 pg. 151, Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "The creature can detect the alignment of another creature. This functions as detect magic, but rather than determining which creatures and objects in the area are magical, the creature can determine one other creature’s alignment.",
      formatKey: "Senses",
      format: "detect alignment.",
      guidelines: ""
    },
    {
      name: "Distraction",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "The creature can nauseate targets that it damages. A living creature that takes damage from a creature with the distraction ability is nauseated for 1 round; the target can negate the effect with a successful Fortitude save at the listed DC.",
      formatKey: "Offensive Abilities",
      format: "distraction (DC 15).",
      guidelines: ""
    },
    {
      name: "Earth Glide",
      abilityType: "Ex",
      source: "Alien Archive pg. 154",
      description: "When the creature burrows, it can pass through dirt, stone, or almost any other sort of earth except metal as easily as a fish swims through water. If protected against fire damage, it can even glide through lava. Its burrowing leaves behind no tunnel or hole, nor does it create any ripple or other sign of its presence.",
      formatKey: "Other Abilities",
      format: "earth glide.",
      guidelines: ""
    },
    {
      name: "Elemental Immunities",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "Elementals are immune to the following effects, unless the effect specifies that it works against elemental creatures:\nBleed, critical hits, paralysis, poison, sleep effects, and stunning.\nFlanking—elementals are unflankable.",
      formatKey: "Immunities",
      format: "elemental immunities.",
      guidelines: ""
    },
    {
      name: "Energy Drain",
      abilityType: "Su",
      source: "Alien Archive pg. 154",
      description: "A successful energy drain attack inflicts one or more negative levels (as described in the ability). If an attack that includes an energy drain scores a critical hit, it inflicts twice the listed number of negative levels. Unless otherwise specified in the draining creature’s description, it gains 5 temporary Hit Points for each negative level it inflicts on an opponent. These temporary Hit Points last for a maximum of 1 hour. Negative levels from energy drain remain until 24 hours have passed or until they are removed with magic or technology. If a negative level isn’t removed before 24 hours have passed, the affected target must attempt a Fortitude saving throw (the exact DC is given in the creature’s stat block). On a success, the negative level goes away. On a failure, the negative level becomes permanent. A separate saving throw is required for each negative level. See page 252 of the Starfinder Core Rulebook for more about negative levels.",
      formatKey: "Melee",
      format: "slam +24 (6d12+22 B plus energy drain); Offensive Abilities energy drain (2 levels, DC 22).",
      guidelines: ""
    },
    {
      name: "Engulf",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 151, Alien Archive 2 pg. 150",
      description: "As a standard action, the creature can move up to its speed, moving into or through the space of any creatures that are at least one size smaller than itself without penalty. Every creature in the engulfing creature’s path is automatically engulfed, with no attack roll needed. A targeted creature can attempt a Reflex saving throw to avoid being engulfed; if it attempts this save, it can’t make an attack of opportunity against the engulfing creature due to that creature’s movement. On a successful save, the target is pushed back or aside (target’s choice) as the engulfing creature continues to move. An engulfed creature gains the pinned condition, takes the listed damage at the beginning of each turn it is engulfed, is in danger of suffocating if it doesn’t have environmental protections, and is trapped within the engulfing creature’s body until it is no longer pinned. An engulfed creature moves with the engulfing creature; this movement does not provoke attacks of opportunity against the engulfed creature. A creature can engulf one creature that is one size smaller than itself, up to two creatures that are two sizes smaller, or up to four creatures that are three sizes smaller.",
      formatKey: "Offensive Abilities",
      format: "engulf (1d6+8 F, DC 13).",
      guidelines: "Use the same damage amount as for the creature’s standard melee attack."
    },
    {
      name: "Fast Healing",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 151, Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "The creature regains the listed number of Hit Points at the start of its turn. Unless otherwise noted, the creature can never exceed its maximum Hit Points.\nFast healing does not restore Hit Points lost from starvation, thirst, or suffocation, nor does it allow a creature to regrow or reattach lost body parts, unless otherwise stated. Fast healing continues to function until a creature dies, at which point the effects of fast healing end immediately.",
      formatKey: "Defensive Abilities",
      format: "fast healing 5.",
      guidelines: ""
    },
    {
      name: "Ferocious Charge",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 150",
      description: "When the creature charges, it can attempt a trip combat maneuver in place of the normal melee attack. In addition, the creature can charge without taking the normal charge penalties to its attack roll or AC. If the creature has another ability that allows it to charge without taking these penalties (such as the charge attack ability from the soldier’s blitz fighting style), it also gains the ability to charge through difficult terrain.",
      formatKey: "Offensive Abilities",
      format: "ferocious charge.",
      guidelines: ""
    },
    {
      name: "Ferocity",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 151, Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "When the creature is brought to 0 Hit Points, it can fight on for 1 more round. It can act normally until the end of its next turn; if it has 0 Hit Points at that point, it dies. If it would lose further Hit Points before this, it ceases to be able to act and dies.",
      formatKey: "Defensive Abilities",
      format: "ferocity.",
      guidelines: ""
    },
    {
      name: "Fly",
      abilityType: "Ex or Su",
      source: "Alien Archive 3 pg. 151, Alien Archive pg. 154, Alien Archive 2 pg. 150",
      description: "The source of the creature’s fly speed (whether extraordinary, supernatural, or from another source such as an item) is noted before its maneuverability. Unless otherwise noted, a creature whose ability to fly is extraordinary can’t fly in a vacuum.",
      formatKey: "",
      format: "",
      guidelines: ""
    },
    {
      name: "Format: Speed fly 60 ft.",
      abilityType: "Ex, perfect",
      source: "",
      description: "",
      formatKey: "",
      format: "",
      guidelines: ""
    },
    {
      name: "Frightful Presence",
      abilityType: "Ex or Su",
      source: "Alien Archive 3 pg. 151, Alien Archive 2 pg. 150, Alien Archive pg. 154",
      description: "The creature’s presence unsettles its foes. It can activate this ability as part of the action of making an attack or as a move action, but it can activate it only once per round. It usually has a range of 30 feet. Opponents within the range must succeed at a Will save or become shaken. The duration is 5d6 rounds unless the ability says otherwise. Once an opponent has been exposed to a creature’s frightful presence (whether or not the opponent succeeds at its saving throw), it cannot be affected by the same creature’s frightful presence for 24 hours. This is an emotion, fear, mind-affecting, and sense-dependent effect.",
      formatKey: "Aura",
      format: "frightful presence (30 ft., Will DC 22).",
      guidelines: ""
    },
    {
      name: "Gaze",
      abilityType: "Su",
      source: "Alien Archive 3 pg. 151, Alien Archive pg. 154, Alien Archive 2 pg. 151",
      description: "Opponents that look at a creature with a gaze ability are in danger of being charmed, paralyzed, turned to stone, or subjected to another negative effect. Each opponent within the gaze’s listed range must attempt a saving throw (usually Fortitude or Will) at the beginning of its turn. On a successful save, the effect is negated. An opponent can give itself an advantage against this ability in one of two ways.\nLooking Obliquely: An opponent that avoids looking directly at the creature’s gaze (either by following the creature’s shadow or by tracking it in a reffective surface) or that looks at the creature through a camera or heads‑up display gains a +4 circumstance bonus to the saving throw. However, the creature with the gaze ability gains concealment against that opponent.\nBlocking Its Vision: By completely blocking or covering its own visual sensors, an opponent doesn’t need to attempt a save against the gaze. However, the creature with the gaze ability gains total concealment against that opponent.\nGaze abilities can affect ethereal opponents but not opponents without visual sensors. A creature is immune to the gaze abilities of others of its kind unless otherwise noted. Allies of a creature with a gaze ability can still be affected, but they are always considered to be looking obliquely at the creature. The creature can also veil its eyes, thus negating its gaze ability.",
      formatKey: "Offensive Abilities",
      format: "paralyzing gaze (60 ft., Will DC 14).",
      guidelines: ""
    },
    {
      name: "Grab",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive 2 pg. 151, Alien Archive pg. 155",
      description: "If the creature hits with the indicated attack (usually a claw or bite attack), it deals the normal damage. If the attack roll result equals or exceeds the target’s KAC + 4, the creature also automatically grapples the foe. (If it equals or exceeds the target’s KAC + 13, the creature instead pins the target.) The creature does not need to have a spare limb free to perform this grapple as long as it can make the listed attack, and it can potentially grapple more than one target if it has more than one attack with the grab ability. The creature can maintain the grab either with another successful grab attack or by performing the grapple combat maneuver normally.",
      formatKey: "Melee",
      format: "claw +8 (1d6+4 plus grab).",
      guidelines: ""
    },
    {
      name: "Immunity",
      abilityType: "Ex or Su",
      source: "Alien Archive 3 pg. 152, Alien Archive pg. 155, Alien Archive 2 pg. 151",
      description: "The creature takes no damage from the listed source. Creatures can be immune to certain types of damage, types of afflictions, conditions, spells (based on school, level, or save type), and other effects. A creature that is immune to critical hits doesn’t take double damage or suffer critical hit effects. A creature that is immune to a listed source doesn’t suffer from its effects or from any secondary effects that it would trigger.",
      formatKey: "Immunities",
      format: "acid, paralysis.",
      guidelines: "A creature usually has one immunity, plus one for every 5 CR. Broad immunities such as immunity to mind‑affecting effects or all magic should be chosen with caution and might count as multiple abilities."
    },
    {
      name: "Integrated Weapons",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive 2 pg. 151",
      description: "The creature’s weapons are manufactured weapons, not natural weapons, and they are integrated into its frame. A creature can’t be disarmed of these weapons, though they can be removed and used if the creature is dead.",
      formatKey: "Defensive Abilities",
      format: "integrated weapons.",
      guidelines: "A manufactured weapon is a weapon with an item level that can be purchased by characters."
    },
    {
      name: "Light Blindness",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive 2 pg. 151, Alien Archive pg. 155",
      description: "The creature is blinded for 1 round when first exposed to bright light, such as sunlight, and it is dazzled for as long as it remains in an area of bright light.",
      formatKey: "Weaknesses",
      format: "light blindness.",
      guidelines: ""
    },
    {
      name: "Limited Plant Benefits",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152",
      description: "Despite being a plant creature, the creature doesn’t gain the standard immunities associated with creatures of the plant type. Instead, a creature with this ability gains a +2 racial bonus on saving throws against mind-affecting effects, paralysis, poison, polymorph, sleep, and stunning effects, unless the effect specifies that it is effective against plants.",
      formatKey: "Defensive Abilities",
      format: "limited plant benefits.",
      guidelines: ""
    },
    {
      name: "Limited Telepathy",
      abilityType: "Ex or Su",
      source: "Alien Archive pg. 155",
      description: "The creature can mentally communicate with any creatures within the listed range with which it shares a language. See page 259 of the Starfinder Core Rulebook for more details.",
      formatKey: "Languages",
      format: "limited telepathy 30 ft.",
      guidelines: ""
    },
    {
      name: "Low-Light Vision",
      abilityType: "Ex",
      source: "Alien Archive pg. 155",
      description: "The creature can see in dim light as if it were normal light. Low-light vision is color vision, unlike darkvision. A creature with low-light vision can read as long as even the tiniest source of light is next to it. Creatures with low-light vision can see outdoors on a moonlit night as well as they can during the day, since the moon casts dim light.",
      formatKey: "Senses",
      format: "low-light vision.",
      guidelines: ""
    },
    {
      name: "Mindless",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive pg. 155, Alien Archive 2 pg. 151",
      description: "The creature has no Intelligence score or modifier and is immune to mind-affecting effects. Any DCs or other statistics that rely on an Intelligence score treat the creature as having a score of 10 (+0).",
      formatKey: "Other Abilities",
      format: "mindless.",
      guidelines: "Mindless creatures usually have fewer good skills and no master skills. Their skills should be based on inborn abilities, since they’re incapable of training."
    },
    {
      name: "Multiarmed",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive 2 pg. 151",
      description: "The creature has the number of arms listed. This allows it to wield and hold up to that many hands’ worth of weapons and equipment. While this increases the number of items it can have at the ready, it doesn’t increase the number of attacks it can make during combat.",
      formatKey: "Other Abilities",
      format: "multiarmed (4).",
      guidelines: ""
    },
    {
      name: "Multiattack",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive 2 pg. 151, Alien Archive pg. 155",
      description: "In addition to its standard melee or ranged attack, the creature has a multiattack entry. When making a full attack, the creature can make all the attacks listed in the multiattack entry at the attack bonuses listed, rather than make two attacks. It can make the attacks in any order.",
      formatKey: "Multiattack",
      format: "bite +10 (1d4+11), 2 claws +10 (1d4+11).",
      guidelines: "Use the appropriate damage column for the creature’s array for all attacks in the multiattack, and impose a –6 penalty on these attacks (rather than the usual –4 penalty for a full attack)."
    },
    {
      name: "Natural Weapons",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 152, Alien Archive pg. 155, Alien Archive 2 pg. 151",
      description: "Natural weapons (and natural attacks), such as acid spit, bite, claw, or slam, don’t require ammunition and can’t be disarmed or sundered.\nIn addition, a player character with this ability as a racial trait is always considered armed. They can deal 1d3 lethal damage (of the listed type, or bludgeoning if no type is specified) with unarmed strikes, and the attack doesn’t have the archaic special property. They also gain a unique Weapon Specialization with their natural weapons at 3rd level, allowing them to add 1-1/2 × their character level to their damage rolls for their natural weapons (instead of just adding their character level, as usual).",
      formatKey: "",
      format: "",
      guidelines: ""
    },
    {
      name: "No Breath",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152, Alien Archive pg. 155",
      description: "The creature doesn’t breathe, and it is immune to effects that require breathing (such as inhaled poison). This does not give it immunity to cloud or gas attacks that don’t require breathing.",
      formatKey: "Other Abilities",
      format: "no breath.",
      guidelines: ""
    },
    {
      name: "Ooze Immunities",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive pg. 155, Alien Archive 2 pg. 152",
      description: "Oozes are immune to the following effects, unless the effect specifies that it works against oozes.\nCritical hits, paralysis, poison, polymorph, sleep, and stunning.\nGaze abilities, illusions, visual effects, and other attacks that rely on sight.\nFlanking—oozes are unflankable.",
      formatKey: "Immunities",
      format: "ooze immunities.",
      guidelines: ""
    },
    {
      name: "Plant Immunities",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152, Alien Archive pg. 155",
      description: "Plants are immune to the following effects, unless the effect specifies it works against plants.\nMind-affecting effects, paralysis, poison, polymorph, sleep, and stunning.",
      formatKey: "Immunities",
      format: "plant immunities.",
      guidelines: ""
    },
    {
      name: "Plantlike",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive pg. 156",
      description: "For effects targeting creatures by type, plantlike creatures count as both their type and plants (whichever type allows an ability to affect them for abilities that affect only one type, and whichever is worse for abilities that affect both types). They also receive a +2 racial bonus to saving throws against mind-affecting effects, paralysis, poison, polymorph, sleep, and stunning, unless the effect specifies that it works against plants.",
      formatKey: "Other Abilities",
      format: "plantlike.",
      guidelines: ""
    },
    {
      name: "Radioactive",
      abilityType: "Ex, Su",
      source: "Alien Archive 3 pg. 153",
      description: "The creature emanates radiation at the listed radiation level to the listed radius. If the radiation level is medium or stronger, the effect suffuses a larger area at a lower level as normal.",
      formatKey: "Aura",
      format: "radioactive (medium, 20 ft., DC 17).",
      guidelines: ""
    },
    {
      name: "Regeneration",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive pg. 156, Alien Archive 2 pg. 152",
      description: "The creature regains Hit Points at the start of its turn, as with fast healing (see page 151), but it can’t die as long as its regeneration is still functioning (although creatures with regeneration still fall unconscious when their Hit Points reach 0). Certain attacks, typically those that deal acid or fire damage, cause a creature’s regeneration to stop functioning for 1 round. During this round, the creature doesn’t regain Hit Points and can die normally. The creature’s stat block describes the types of damage that suppress the regeneration.\nRegeneration doesn’t restore Hit Points lost from starvation, thirst, or suffocation. Creatures with regeneration can regrow lost portions of their bodies and can reattach severed body parts if they are recovered within 1 hour of severing. Severed parts that aren’t reattached wither and decompose normally.\nA creature usually must have a Constitution score or modifier to have this ability.",
      formatKey: "Defensive Abilities",
      format: "regeneration 5 (acid).",
      guidelines: ""
    },
    {
      name: "Resistance",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152, Alien Archive pg. 156",
      description: "The creature ignores some damage of a certain type (acid, cold, electricity, fire, or sonic) per attack, but it does not have total immunity.",
      formatKey: "Resistances",
      format: "acid 10.",
      guidelines: ""
    },
    {
      name: "See in Darkness",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 152, Alien Archive pg. 156",
      description: "The creature can see perfectly in darkness of any kind, including magical darkness.",
      formatKey: "Senses",
      format: "see in darkness.",
      guidelines: ""
    },
    {
      name: "Sense Through",
      abilityType: "Su",
      source: "Alien Archive pg. 156",
      description: "The creature can sense through obstacles that would normally block the ability to perceive what is beyond them. The specific sense this ability applies to is indicated in parentheses after the sense through entry in the creature’s statistics. If the ability allows the creature to sense through only a specific material, that material is listed after the specific sense. For more information on sense through, see page 264 of the Starfinder Core Rulebook.",
      formatKey: "Senses",
      format: "sense through (vision).",
      guidelines: ""
    },
    {
      name: "Sightless",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive pg. 156, Alien Archive 2 pg. 152",
      description: "The creature does not use any visual senses and is thus never subject to any effect that requires the creature to see a target or effect. Sightless creatures normally have some form of blindsight to compensate for their sightlessness, but if not, they are assumed to be able to operate as well as a creature with normal vision unless the creature’s description says otherwise.",
      formatKey: "Senses",
      format: "sightless.",
      guidelines: ""
    },
    {
      name: "Solar Adaptation",
      abilityType: "Ex or Su",
      source: "Alien Archive 2 pg. 152",
      description: "The creature can survive within a star despite the luminance, pressure, radiation, and convection currents. In addition, while within a star, the creature can move as if it had a supernatural fly speed equal to its fastest speed.",
      formatKey: "Other Abilities",
      format: "solar adaptation.",
      guidelines: "A creature with solar adaptation should also have the fire subtype or immunity to fire."
    },
    {
      name: "Spaceflight",
      abilityType: "Su",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152",
      description: "The creature can fly through space at standard navigation and astrogation speeds using Piloting to navigate. If it uses a skill other than Piloting for skill checks to astrogate, that skill is listed in parentheses.",
      formatKey: "Other Abilities",
      format: "spaceflight (Mysticism).",
      guidelines: "Most creatures with spaceflight also have void adaptation."
    },
    {
      name: "Spell Resistance",
      abilityType: "Ex",
      source: "Alien Archive pg. 156",
      description: "The creature can avoid the effects of some spells and spelllike abilities that would directly affect it. To determine whether a spell or spell-like ability works against a creature with spell resistance, the caster must attempt a caster level check (1d20 + caster level). If the result equals or exceeds the creature’s spell resistance, the spell works normally, though the creature can still attempt any saving throws normally allowed. See page 265 of the Starfinder Core Rulebook for more information.",
      formatKey: "SR",
      format: "18.",
      guidelines: ""
    },
    {
      name: "Spider Climb",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152",
      description: "The creature can climb as though affected by the spell spider climb.",
      formatKey: "Speed",
      format: "spider climb.",
      guidelines: ""
    },
    {
      name: "Stellar Alignment",
      abilityType: "Su",
      source: "Alien Archive 3 pg. 153, Alien Archive 2 pg. 152, Alien Archive pg. 156",
      description: "The creature is aligned to the cycles of solar systems. Creatures with stellar alignment usually have stellar revelations and zenith revelations, either ones from the solarian class or ones unique to the creature. When using stellar revelations, the creature is always considered attuned. However, it’s not always considered fully attuned, so it normally can’t always use zenith powers. When you roll initiative for the creature, roll 1d3. Once that many rounds have elapsed, the creature is considered fully attuned and gains access to its zenith powers. After it uses a zenith power, it’s no longer fully attuned, and you roll 1d3 again to see how many rounds it will take to recharge.\nIf a creature has stellar alignment (graviton) or stellar alignment (photon), it’s considered to be attuned only in the indicated mode and can become fully attuned only in the indicated mode, as described above.",
      formatKey: "Other Abilities",
      format: "stellar alignment (graviton).",
      guidelines: ""
    },
    {
      name: "Summon Allies",
      abilityType: "Sp",
      source: "Alien Archive 2 pg. 152, Alien Archive pg. 156",
      description: "The creature can attempt to summon creatures of the same creature type as itself as a full action. The summoned ally cannot summon its own allies, is worth 0 experience points, and returns to the place from which it came after 1 hour.",
      formatKey: "Spell-Like Abilities",
      format: "1/day—summon allies (1 imp 60%).",
      guidelines: "Choose either a creature of the same CR as the monster (with a 35% chance of success) or a creature with a CR no greater than the monster’s CR – 5 (with a 60% chance of success)."
    },
    {
      name: "Swallow Whole",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 154, Alien Archive 2 pg. 153, Alien Archive pg. 156",
      description: "If the creature hits with the indicated attack (usually a bite attack), it deals the normal damage. If the creature’s attack roll hits the target’s KAC + 4, the creature also automatically grapples the foe as part of the attack action. (If it hits the target’s KAC + 13, it instead pins the target). The creature doesn’t need to have a free limb to perform this grapple. Unless otherwise specified, a creature can swallow whole only targets that are at least one size category smaller than itself, and it has room for a single target of that size in its stomach (doubling the maximum number of creatures it can have swallowed for each additional size category by which these creatures are smaller).\nOn the creature’s next turn after grappling or pinning the target, if the target has not escaped the grapple or pin, the target automatically takes the attack’s damage at the beginning of the creature’s turn. The creature can then make a new attack roll with the same attack. If the roll equals or exceeds the target’s KAC, the grapple or pin is maintained. If the roll equals or exceeds the target’s KAC + 4, the target is swallowed whole (no damage is dealt).\nOnce swallowed, the target takes the listed swallow whole damage automatically at the beginning of its turn every round. The target is considered grappled as long as it is swallowed. The target can attempt to cut its way out (the interior of a creature with swallow whole has the same EAC as its exterior and a KAC equal to that of its exterior – 4) by dealing an amount of damage equal to onequarter the swallowing creature’s total Hit Points, though any attack that does not deal slashing damage deals only half its normal damage. If a target cuts its way out of the creature, the creature cannot use swallow whole again until that damage is healed.\nAlternatively, a target swallowed whole can attempt to climb out. The swallowed creature must succeed at both a grapple check against the creature’s internal KAC + 8 and an Athletics check to climb (DC = 10 + 1-1/2 × the creature’s CR). Each of these actions takes a full round. If both checks are successful, the target climbs back up to the creature’s mouth and can escape, ending up in an open square adjacent to the creature.\nOffensive Abilities swallow whole (5d4+16 A, EAC 30, KAC 27, 71 HP).",
      formatKey: "Melee",
      format: "bite +19 (5d4+16 P plus swallow whole);",
      guidelines: "Use the same damage amount as for the creature’s standard melee attack."
    },
    {
      name: "Swarm Attack",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 153, Alien Archive pg. 157",
      description: "The creature automatically deals the listed damage to each creature whose space it occupies at the end of its turn, with no attack roll needed. Swarm attacks are not subject to a miss chance for concealment or cover.",
      formatKey: "Melee",
      format: "swarm attack (1d6+2 P).",
      guidelines: "To determine the amount of damage a creature of CR 6 or lower deals with swarm attack, use the value listed in the CR 6 Three Attacks entry on its appropriate array table, lowering the additional damage from that CR to match its actual CR. For all other creatures, use the Four Attacks entry for its CR in the corresponding array table."
    },
    {
      name: "Swarm Defenses",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 153, Alien Archive pg. 157",
      description: "Swarms take damage from weapons differently depending on how the weapon targets them.\nA swarm is immune to attacks and effects that target a single creature (including single-target spells), with the exception of mind-affecting effects if the swarm has an Intelligence score and an ability similar to a formian’s hive mind.\nA swarm takes half again as much damage (+50%) from effects that affect all targets in an area, such as grenades, blast and explode weapons, and many evocation spells.\nA swarm takes normal damage from an attack or effect that affects multiple targets (including lines and fully automatic mode attacks). For the purpose of automatic fire, the swarm counts as five targets. For example, if an automatic attack is made using 12 rounds of ammunition, it can attack a maximum of six targets, so it can damage a swarm normally. However, if two other targets are closer to the attacker than the swarm, they must be attacked first, leaving only four attacks to target the swarm, so it takes no damage.",
      formatKey: "Defensive Abilities",
      format: "swarm defenses.",
      guidelines: ""
    },
    {
      name: "Swarm Immunities",
      abilityType: "Ex",
      source: "Alien Archive 2 pg. 153, Alien Archive pg. 157",
      description: "Swarms are immune to the following effects, unless the effect specifies it works against swarms.\nBleeding, critical hits, flat-footed, off-target, pinned, prone, staggered, and stunned.\nCombat maneuvers—swarms can’t be affected by and can’t perform combat maneuvers, unless the swarm’s description says otherwise.\nFlanking—swarms are unflankable.\nDying—a swarm reduced to 0 Hit Points breaks up and ceases to exist as a swarm, though individual members of it might survive.",
      formatKey: "Immunities",
      format: "swarm immunities.",
      guidelines: ""
    },
    {
      name: "Swarm Mind",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 154",
      description: "",
      formatKey: "",
      format: "",
      guidelines: ""
    },
    {
      name: "Members of the Swarm are bound together into a singular hive mind by a blend of exuded pheromones, imperceptible movements of antennae and limbs, electrostatic fields, and telepathic communication. All Swarm creatures with 30 feet of each other are in constant communication; if one is aware of a threat, all are.",
      abilityType: "Such awareness can spread along a “chain” of Swarm creatures under appropriate circumstances, potentially alerting distant Swarm creatures",
      source: "",
      description: "",
      formatKey: "Defensive Abilities",
      format: "Swarm mind.",
      guidelines: ""
    },
    {
      name: "Tracking",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 154, Alien Archive 2 pg. 153, Alien Archive pg. 157",
      description: "The creature can use the Perception skill to perform the follow tracks task of the Survival skill with the listed sense. The sense is usually related to a type of signature that most creatures leave behind, such as a scent or heat trail. The creature might gain a bonus or penalty to its Perception check to follow tracks depending on the strength of the quarry’s signature, at the GM’s discretion. It is possible for stronger signatures to completely mask other signatures, making following tracks with a weaker signature very difficult.",
      formatKey: "Other Abilities",
      format: "tracking (scent).",
      guidelines: ""
    },
    {
      name: "Trample",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 154, Alien Archive pg. 157, Alien Archive 2 pg. 154",
      description: "As a full action, the creature can move up to its speed and through the space of any creatures that are at least one size smaller than itself. The creature does not need to make an attack roll; each creature whose space it moves through takes damage. A target of a trample can attempt a Reflex save with the listed DC to take half damage; if it attempts the save, it can’t make an attack of opportunity against the trampling creature due to the creature’s movement. A creature can deal trample damage to a given target only once per round.",
      formatKey: "Offensive Abilities",
      format: "trample (3d4+14 B, DC 16).",
      guidelines: "The amount of damage the trample deals should be the same as the creature’s standard melee damage."
    },
    {
      name: "Troop Attack",
      abilityType: "Ex",
      source: "Starfinder #21: Huskworld pg. 61",
      description: "The creature doesn’t make standard melee attacks. Instead, it deals automatic damage to any creature within its reach or whose space it occupies at the end of its turn, with no attack roll needed. A troop threatens all creatures within its reach or within its area and resolves attacks of opportunity by dealing automatic troop damage to any foe in reach that provokes an attack of opportunity. A troop is still limited to making one such attack per round unless stated otherwise. A troop can perform grapple and sunder combat maneuvers, but no other combat maneuvers, unless the troop’s description states otherwise.",
      formatKey: "Melee",
      format: "troop attack (1d4+10 P).",
      guidelines: "To determine the amount of damage a troop of CR 6 or lower deals with its troop attack, use the dice value listed for CR 6 in the Melee Damage, Three Attacks column on its appropriate array table (see pages 129–132 of Alien Archive), lowering the additional damage added to the dice value to match the additional damage of its actual CR and adding its Strength modifier as normal. For creatures of all other CRs, use the damage listed in the Melee Damage, Four Attacks entry for its CR in the corresponding array table."
    },
    {
      name: "Troop Defenses",
      abilityType: "Ex",
      source: "Starfinder #21: Huskworld pg. 61",
      description: "Troops take damage from attacks differently depending on how the attack targets them.\nA troop takes half damage from attacks that effect a single target (such as shot from a semi-auto pistol). A troop is immune to effects that target a specific number of creatures (including single-target spells and multiple-target spells such as haste).\nA troop takes half again as much damage (+50%) from effects that affect all targets in an area, such as grenades, blast and explode weapons, and many evocation spells.\nA troop takes normal damage from an attack or effect that affects multiple targets (including lines and fully automatic mode attacks). For the purposes of the automatic weapon special property, a troop counts as five targets. For example, if an automatic attack is made using 12 rounds of ammunition, the attack affects a maximum of six targets, so it can damage a troop normally. However, if two other targets are closer to the attacker than the troop, they must be attacked first, leaving only four attacks to target the troop, so the troop takes no damage.",
      formatKey: "Defensive Abilities",
      format: "troop defenses.",
      guidelines: ""
    },
    {
      name: "Troop Immunities",
      abilityType: "Ex",
      source: "Starfinder #21: Huskworld pg. 61",
      description: "Troops are immune to the following effects, unless the effect specifies it works against swarms or troops.\nPinned, prone, staggered, and stunned.\nCombat maneuvers—a troop can’t be subject to combat maneuvers, unless it’s affected by area effects that include such effects or the troop’s description says otherwise.\nFlanking—troops are unflankable.\nDying—a troop reduced to 0 Hit Points breaks up and is effectively destroyed, though individual members of it might survive.",
      formatKey: "Immunities",
      format: "troop immunities.",
      guidelines: ""
    },
    {
      name: "Truespeech",
      abilityType: "Su",
      source: "Alien Archive 3 pg. 154, Alien Archive 2 pg. 154, Alien Archive pg. 158",
      description: "The creature can speak with any other creature that has a language. This ability is always active.",
      formatKey: "Languages",
      format: "truespeech.",
      guidelines: ""
    },
    {
      name: "Undead Immunities",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 154, Alien Archive pg. 158, Alien Archive 2 pg. 154",
      description: "Undead are immune to the following effects, unless the effect specifies it works against undead creatures.\nBleed, death effects, disease, mind-affecting effects, paralysis, poison, sleep, and stunning.\nAbility damage, ability drain, energy drain, exhaustion, fatigue, negative levels, and nonlethal damage.\nAny effect that requires a Fortitude save (unless the effect works on objects or is harmless).",
      formatKey: "Immunities",
      format: "undead immunities.",
      guidelines: ""
    },
    {
      name: "Unflankable",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 155, Alien Archive 2 pg. 154, Alien Archive pg. 158",
      description: "Flanking the creature does not grant any bonuses, and abilities that function only against a creature that is flanked do not function against it.",
      formatKey: "Defensive Abilities",
      format: "unflankable.",
      guidelines: ""
    },
    {
      name: "Unliving",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 155, Alien Archive pg. 158, Alien Archive 2 pg. 154",
      description: "The creature has no Constitution score or modifier. Any DCs or other statistics that rely on a Constitution score treat the creature as having a score of 10 (+0). The creature is immediately destroyed when it reaches 0 Hit Points. An unliving creature doesn’t heal damage naturally, but a construct can be repaired with the right tools. Spells such as make whole can heal constructs, and magic effects can heal undead. An unliving creature with fast healing still benefits from that ability. Unliving creatures don’t breathe, eat, or sleep. They can’t be raised or resurrected, except through the use of miracle, wish, or a similar effect that specifically works on unliving creatures.",
      formatKey: "Other Abilities",
      format: "unliving.",
      guidelines: ""
    },
    {
      name: "Void Adaptation",
      abilityType: "Ex or Su",
      source: "Alien Archive 3 pg. 155, Alien Archive 2 pg. 154",
      description: "Numerous creatures are inured to the void of outer space. A creature with void adaptation has the following abilities.\nImmunity to cosmic rays.\nImmunity to the environmental effects of vacuum.\nNo breath.",
      formatKey: "Defensive Abilities",
      format: "void adaptation.",
      guidelines: ""
    },
    {
      name: "Vortex",
      abilityType: "Ex or Su",
      source: "Alien Archive 2 pg. 154, Alien Archive pg. 158",
      description: "A vortex ability works identically to the whirlwind ability, except the creature gains a swim speed instead of a fly speed, it can form only in a liquid (such as in water), it cannot leave a liquid medium, and it always blocks all vision within it and line of sight past it. In addition, carried creatures must have a swim speed in order to attempt a Reflex save to escape.",
      formatKey: "Offensive Abilities",
      format: "vortex (4d6+8 B, DC 15, 1/day).",
      guidelines: ""
    },
    {
      name: "Vulnerability",
      abilityType: "Ex or Su",
      source: "Alien Archive 3 pg. 155, Alien Archive pg. 158, Alien Archive 2 pg. 154",
      description: "The creature takes half again as much damage (+50%) when it takes damage of a specific type. Creatures with a vulnerability to an effect that doesn’t deal damage instead take a –4 penalty to saves against spells and effects that cause or use the listed vulnerability (such as enchantments). Some creatures might suffer additional effects, as noted in their stat blocks.",
      formatKey: "Weaknesses",
      format: "vulnerable to fire.",
      guidelines: ""
    },
    {
      name: "Water Breathing",
      abilityType: "Ex",
      source: "Alien Archive 3 pg. 155, Alien Archive 2 pg. 154, Alien Archive pg. 158",
      description: "The creature can breathe water. It can’t breathe air unless it has the amphibious special ability.",
      formatKey: "Other Abilities",
      format: "water breathing.",
      guidelines: ""
    },
    {
      name: "Whirlwind",
      abilityType: "Ex or Su",
      source: "Alien Archive 2 pg. 154, Alien Archive pg. 158",
      description: "The creature can transform into a whirlwind as a standard action. Unless otherwise specified, the creature can remain in whirlwind form for a number of rounds equal to half its CR. If the creature has a fly speed, it retains that in its whirlwind form. If it does not have a fly speed, it gains an extraordinary fly speed (with average maneuverability) equal to its base speed. A creature in whirlwind form can move freely into and through other creatures’ spaces, and it does not provoke attacks of opportunity as a result of its movement.\nThe base of a creature in whirlwind form occupies a 5-foot square. The whirlwind is twice as wide at its top as its base and has a height equal to four times the width of its base; this doesn’t change the size category of the creature. If a creature is Large or larger, it can vary the size of its whirlwind form up to a maximum of a base equal to its normal space as a swift or move action. A creature in whirlwind form does not threaten any spaces around it, and it cannot make its normal attacks.\nIf a creature in whirlwind form enters the space of another creature, that creature must succeed at a Fortitude save with the listed DC or take the whirlwind’s listed damage. If the whirlwind covers all of the creature’s space, the creature must also succeed at a Reflex save or be picked up by the whirlwind and carried along with it. A carried creature is flat.footed, grappled, and off-target, and it automatically takes the whirlwind's damage at the beginning of its turn. If the carried creature can fly, it can attempt a Reflex save as a move action, escaping on a successful save. If a carried creature does not escape, it can attempt a Fortitude save; if it succeeds, it can take any remaining actions it has on its turn (other than movement). On a failed save, the carried creature is unable to act until its next turn or until the whirlwind releases it.\nA creature in whirlwind form can carry up to two creatures of its size, with the total number it can carry doubling for every size category the affected creatures are smaller than the whirlwind. The creature in whirlwind form can eject a carried creature at any time during its turn, dropping the carried creature in a space of its choice adjacent to its position at the time of ejection. At the GM's discretion, if the whirlwind is in contact with dirt, gases, water, or other material that can be easily drawn into it, the whirlwind blocks all vision within it (including darkvision) and blocks line of sight through it.",
      formatKey: "Offensive Abilities",
      format: "whirlwind (4d6+8 B, DC 15, 1/day).",
      guidelines: "This ability is generally usable once per day, plus one additional time per day for every 5 CR the creature has. The amount of damage the whirlwind deals should be the same as the creature's standard melee damage. Whirlwinds normally deal bludgeoning damage."
    }
  ];