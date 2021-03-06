﻿/**
 * Contains functions for generating contents for the skill and familiar database
 */

function generateSkill() {
    var lastId = +document.getElementById('skill').value;
    var content = "";
    var warnings = "";
    var total = 0, saccable = 0;
    for (var i = 0; i < srcdb.skills.length; i++) {
        var skill = srcdb.skills[i];
        var id = +skill.id;
        if (id > lastId && ((lastId < 10000 && id < 10000) || (lastId > 10000 && id > 10000))) {
            var skillTxt = "";
            skillTxt += (id + ": {\n" +
                "    name: \"" + skill.name + "\", type: " + skill.skillType + ", func: " + skill.skillFunc +
                ", calc: " + skill.skillCalcType + ",\n");

            if (skill.skillFunc == ENUM.SkillFunc.RANDOM) {
                warnings += ("Warning: " + id + " - " + skill.name + ": is a random skill.\n");
            }

            // the arguments
            var lastArg = -1; // the last arg that is not 0
            for (var j = 10; j > 0; j--) {
                var key = "skillFuncArg" + j;
                if (skill[key] != 0) {
                    lastArg = j;
                    break;
                }
            }

            if (lastArg != -1) {
                var args = "";
                for (j = 1; j <= lastArg; j++) {
                    args += skill["skillFuncArg" + j];

                    if ((j == 2 || j == 7) && skill["skillFuncArg" + j] == 16) {
                        warnings += ("Warning: " + id + " - " + skill.name + ": skillFuncArg" + j + " is 16. " +
                            "Check arg1 or arg6, make sure their skillType is 16.\n");
                    }

                    if (j != lastArg) {
                        args += ", ";
                    }
                }
                skillTxt += ("    args: [" + args + "],\n");
            }

            skillTxt += ("    range: " + skill.skillRange + ", prob: " + skill.maxProbability + ",");

            if (Skill.isAttackSkill(null, skill)) {
                skillTxt += (" ward: " + Skill.getWardType(skill) + ",");
            }

            if (id > 10000) {
                skillTxt += (" isAutoAttack: true,");
            }

            total++;
            if (isSkillSaccable(id)) {
                skillTxt += (" sac: 1,");
                saccable++;
            }

            skillTxt += ("\n    desc: \"" + skill.comment + "\"\n},");
            content += (skillTxt + "\n\n");
        }
    }

    content += ("\n\n" + warnings);

    document.getElementById('result').innerText = content;
    console.log("Total: " + total + " skills, saccable: " + saccable + " skills.");
}

function generateFam() {
    var names = document.getElementById('famList').value.split('\n');
    var content = "";
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        for (var j = 0; j < srcdb.cards.length; j++) { // O(n^2), but who cares...
            var card = srcdb.cards[j];
            if (card.name != name) continue;

            // heuristic, of course
            var shortName = name.split(" ").shift().replace(",", "");
            content += (card.id + ": {\n" +
                "    name: \"" + shortName + "\", stats: [" + card.popeHp + ", " + card.popeAtk + ", " +
                card.popeDef + ", " + card.popeWis + ", " + card.popeAgi + "],\n");

            var skills = "";
            for (var skillIndex = 1; skillIndex <= 3; skillIndex++) {
                if (card["skillId" + skillIndex] != 0) {
                    skills += card["skillId" + skillIndex];
                    if (card["skillId" + (skillIndex + 1)] != 0) {
                        skills += ", ";
                    }
                } else {
                    break; // assuming all empty skill slots are at the end
                }
            }

            content += ("    skills: [" + skills + "],\n");

            if (card.defaultSkillId != 0) {
                content += ("    autoAttack: " + card.defaultSkillId  + ",\n");
            }

            if (card.cardType == 5) {
                content += ("    isMounted: true,\n");
            }

            content += ("    img: \"foobar\",\n" +
                "    fullName: \"" + name + "\"\n},\n");
        }
    }

    document.getElementById('result').innerText = content;
}

function isSkillSaccable(id) {
    for (var k = 0; k < srcdb.cards.length; k++) {
        var card = srcdb.cards[k];
        if (isCardHasSkill(card, id) && isEpicOrHigher(card) && !isDualSkillFamiliar(card)) {
            return true;
        }
    }
    return false;
}

function isDualSkillFamiliar(card) {
    // relies on the fact that there is no card with skillId3 != 0 yet
    return card.skillId1 != 0 && card.skillId2 != 0;
}

function isEpicOrHigher(card) {
    return card.rarity == 4 || card.rarity == 5 || card.rarity == 6;
}

function isCardHasSkill(card, skillId) {
    return card.skillId1 == skillId || card.skillId2 == skillId || card.skillId3 == skillId;
}