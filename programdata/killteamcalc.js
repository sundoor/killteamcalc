/**
 * Kill Team shooting probability calculator
 * (c)2023 Sándor Preszter - https://www.gnu.org/licenses/gpl-3.0.html
 * 
 * @author	Sándor Preszter <preszter.sandor@gmail.com>
 * @version	1.00
 * @since	2023-02-09 
 */
class attackerObject
{
	weaponName = "Weapon";
	a = 0;  		// Attack dice
	bs = 0;         	// Ballistic Skill
	damageHit = 0;  	// Normal damage on hit
	damageCrit = 0; 	// Damage on crit
	apx = 0;		// Armor Penetration (reduced defence dice)
	px = 0;			// Piercing (armor penetration on crit)
	lethalx = 0;		// Lethal (lowers crit threshold)
	mwx = 0;		// Mortal wounds on crit
	splashx = 0;		// Area-of-effect
	relentless = 0;		// All dice rerollable
	ceaseless = 0;		// Dice results of 1 are rerollable
	balanced = 0;		// One die is rerollable
	rending = 0;		// On crit, a normal hit converts to crit
	cpreroll = 0;		// Command Point dice rerolls			
}

class targetObject
{
	df = 0;  		// Number of defence dice
	svx = 0;        	// Defence save X+
	autosave = 0;		// Number of defence dice to be retained as automatic normal saves due to cover
	w = 0;    		// Wounds (hitpoints)
	invulnerable = 0;	// Immune to armor penetration		
}

/* Calculate all possible dice permutations and consolidate them into combinations
   Outputs an array of objects, array length is the number of possible permutations
*/

// Combination object template 
class combinationObject
{       
	count = 1;
	miss = 0; 
	hit = 0; 
	crit = 0;
	mw = 0;		// Mortal wounds need to be tracked separately, because they cannot be neutralized by saves. Mortal wounds are calculated after all rerolls and weapon specials.
	ones = 0;	// Dice rolls of 1	
}

// Main dice iterator and dice combination aggregator		
var combinationMatrix = function(maxiterations, bsx, lethalx)
{
	cMatrix = new Array();
		
        // Iterating permutations
        // Iterating maximum 6 attack dice      
	iterations = new Array([1,1]);
	for(b=1; b<=6; b++)
	{
		iterations.push( (maxiterations >= b)? [1,6] : [1,1] );
	}
		
	for(iterations[1][0]=1; iterations[1][0]<=iterations[1][1]; iterations[1][0]++)
	{	
		for(iterations[2][0]=1; iterations[2][0]<=iterations[2][1]; iterations[2][0]++)
		{
			for(iterations[3][0]=1; iterations[3][0]<=iterations[3][1]; iterations[3][0]++)
			{
				for(iterations[4][0]=1; iterations[4][0]<=iterations[4][1]; iterations[4][0]++)
				{
					for(iterations[5][0]=1; iterations[5][0]<=iterations[5][1]; iterations[5][0]++)
					{
						for(iterations[6][0]=1; iterations[6][0]<=iterations[6][1]; iterations[6][0]++)
						{
							combination = new combinationObject();
							
							for(i=1; i<=6; i++)
							{
								if(iterations[i][1] > 1)
								{
									if(iterations[i][0] >= lethalx || iterations[i][0] == 6){ combination.crit++; }
									else if(iterations[i][0] >= bsx){ combination.hit++; }
									else { combination.miss++; if(iterations[i][0] == 1){ combination.ones++; } }
								}	
							}
							
							if(typeof cMatrix[combination.miss + "|" + combination.hit + "|" + combination.crit + "|" + combination.ones] === 'undefined')
							{			
								cMatrix[combination.miss + "|" + combination.hit + "|" + combination.crit + "|" + combination.ones] = combination;
							}
							else
							{
								cMatrix[combination.miss + "|" + combination.hit + "|" + combination.crit + "|" + combination.ones].count++;	
							}
						}
					}
				}	
			}	
		}		
	}
	
	delete iterations;
	return cMatrix;	
}


/* Calculate probabilities for given distinct attack results
   Outputs an array of objects, array length is the number of possible distinct attack combinations with probability
*/
class probabilityObject
{ 
	constructor(p, miss, hit, crit, mw, ones)
	{	
		this.p = p;      
		this.miss = miss; 
		this.hit = hit; 
		this.crit = crit;
		this.mw = mw;		// Mortal wounds need to be tracked separately, because they cannot be neutralized by saves. Mortal wounds are calculated after all rerolls and weapon specials.
		this.ones = ones;	// Dice rolls of 1
	}	
}

var probabilityMatrix = function(inputMatrix)
{
	let outputMatrix = new Array();	
  	let permutationCount = 0;
  	
  	for(const key in inputMatrix)
  	{	
  		permutationCount += inputMatrix[key].count;
  	}
  	
  	// Calculate probabilities for each combination
  	for(const key in cMatrix)
  	{
  		pObject = new probabilityObject(
  			inputMatrix[key].count / permutationCount,
		  	inputMatrix[key].miss, 
			inputMatrix[key].hit, 
			inputMatrix[key].crit, 
			inputMatrix[key].mw,
			inputMatrix[key].ones	
		);
  		outputMatrix[key] = pObject;	
  	}	
  	
  	return outputMatrix;
}







// WEAPON SPECIALS
var weaponSpecialAdjustedProbabilityMatrix = function(inputMatrix, attacker)
{
	/* REROLLS
		Reroll calculation logic:
  		ASSUMPTION: only misses will be rerolled
  		1. Cycle through the miss/hit/crit combinations
  		2. If there is a miss, generate the possible outcomes of the rerolled dice for the given combination
  			eg. for a 1/1/1 miss/hit/crit combination with a miss reroll the possible outcomes are: 1/1/1, 0/2/1, 0/1/2
  		3. Calculate the probability of the above outcomes
  		4. Weigh the probabilities with the probability of the initial combination
  		5. Deduct the probabilities of the changed combinations from the probability of the initial combination
  			eg. the probabilities of the 0/2/1 and 0/1/2 outcomes are deduced from the probability of the initial combination (1/1/1)
  			remaining probability value for 1/1/1 will be probability of the reroll having no effect
  		6. Add the probabilities of the changed combinations to their respective combinations
	*/
	let outputMatrix = new Array();
	
	for(const key in inputMatrix)
	{	
		let pObject = new probabilityObject(
  			inputMatrix[key].p,
		  	inputMatrix[key].miss, 
			inputMatrix[key].hit, 
			inputMatrix[key].crit, 
			inputMatrix[key].mw,
			inputMatrix[key].ones	
		);
		
		outputMatrix[key] = pObject;
	}
		
	// No reroll specials, no rerolls
	if(attacker.balanced || attacker.relentless || attacker.ceaseless || attacker.cpreroll)
	{
		for(const key in outputMatrix)
		{		
	  		// No miss, no reroll
	  		if(outputMatrix[key].miss > 0)
			{
				// Relentless trumps all reroll rules (all attack dice can be rerolled)
				if(attacker.relentless)
				{
					rerollPool = outputMatrix[key].miss;	// All misses are rerolled	       	
				}
				else
				{
					// First reroll 1s, then reroll 1 die with balanced, then Command Point rerolls
					rerollPool = ((attacker.ceaseless)? outputMatrix[key].ones : 0) + ((attacker.balanced)? 1 : 0) + attacker.cpreroll;
					rerollPool = (rerollPool > outputMatrix[key].miss)? outputMatrix[key].miss : rerollPool; // If the possible rerolls exceed misses, make sure only misses are rerolled 
				}
				
				// Create a new probability set out of the dice to be rerolled
				rerollMatrix = new combinationMatrix(rerollPool, attacker.bsx, attacker.lethal);
				rerollMatrix = new probabilityMatrix(rerollMatrix);
				
				for(const rkey in rerollMatrix)
				{ 
					nmiss = outputMatrix[key].miss - rerollMatrix[rkey].hit - rerollMatrix[rkey].crit;
					nhit =  outputMatrix[key].hit + rerollMatrix[rkey].hit;
					ncrit = outputMatrix[key].crit + rerollMatrix[rkey].crit;
					nones = rerollMatrix[rkey].ones;
					dp = inputMatrix[key].p*rerollMatrix[rkey].p; // Probability of new outcome weighed with the original outcome
									
					outputMatrix[nmiss+"|"+nhit+"|"+ncrit+"|"+nones].p += dp;
					outputMatrix[key].p -= dp;		
				}		
			}	
		}
	}
	// Mortal wound calculations
	// Mortal wounds are calculated once the total number of crit rolls are finalized (rerolls, lethal modifiers, rending etc.)
	// Mortal wounds must be calculated before saves, because they are unaffected by saves
	for(const key in outputMatrix)
  	{
  		if(attacker.rending && outputMatrix[key].crit > 0 && outputMatrix[key].hit > 0)
  		{
  			outputMatrix[key].crit++;
			outputMatrix[key].hit--;	
  		}
  		outputMatrix[key].mw = outputMatrix[key].crit*(attacker.mwx + attacker.splashx);		
  	}
  	
  	return outputMatrix;
}










// CALCULATE SAVES
var saveAdjustedProbabilityMatrix = function(inputMatrix, attacker, target)
{	 
        // The program assumes that autosaves are always utilized if available
        // In Kill Team sometimes it can be beneficial not to utilize autosaves, but this is not coded here
        
        // In the below algorithm autosaves only decrease the total number of defence dice (autosaves are added to the normal save pool in a different function)
        
	let maxiterationsN = target.df - target.autosave - ((target.invulnerable)? 0 : attacker.apx); // Invulnerable save nullifies armor penetration
	maxiterationsN = (maxiterationsN < 0)? 0 : maxiterationsN; // Prevent negative save rolls
	let saveRollMatrixN = new combinationMatrix(maxiterationsN, target.svx, 6);	
	saveRollMatrixN = new probabilityMatrix(saveRollMatrixN); 
	
	
	// Create another set of saves for Piercing activation
	// Armor penetration only happens in case there is at least one critical hit, so need to use both sets depending on distinct dice roll result 
	if(attacker.px > 0)
	{
		let maxiterationsP = target.df - target.autosave - ((target.invulnerable)? 0 : (attacker.apx + attacker.px));
		maxiterationsP = (maxiterationsP < 0)? 0 : maxiterationsP; // Prevent negative save rolls
		let saveRollMatrixP = new combinationMatrix(maxiterationsP, target.svx, 6);	
		saveRollMatrixP = new probabilityMatrix(saveRollMatrixP);
	} 
	
	
	
	
	// Miss property means the save fails
	// Hit property means the save succeeds
	// Crit property means the save critically succeeds

	let outputMatrix = new Array();
	
	for(const key1 in inputMatrix)
	{
		// In case there is a Piercing ability and there is at least 1 crit in the roll, use the Piercing-modified save set
		saveRollMatrix = (attacker.px > 0 && inputMatrix[key1].crit > 0)? saveRollMatrixP : saveRollMatrixN;
		
		for(const key2 in saveRollMatrix)
		{
			// Attack results
		        miss = inputMatrix[key1].miss;
		        hit = inputMatrix[key1].hit;
			crit = inputMatrix[key1].crit;
			
			// Save results
			smiss = saveRollMatrix[key2].miss;
			shit = saveRollMatrix[key2].hit + target.autosave;        // Pun intended variable name // Autosaves are added to normal save pool
			scrit = saveRollMatrix[key2].crit;
			
			// Test if there are any hits at all, otherwise there is no sense rolling save dice
			// In other words, the probability of a full miss does not change
			if(hit > 0 || crit > 0)
			{
				// Test if prioritizing using critical saves to neutralize critical hits make rational sense
				// Example: Meltagun has 6/3 hit/crit damage. Although crits come with 4 MW, mortal wounds cannot be saved. Saving the critical will only save 3 damage. In this case, saving normal damage makes more sense.
				if(crit > 0 && (attacker.damageCrit >= attacker.damageHit || hit == 0))
				{
					crit -= scrit;   
					// If crit turns negative, it means there are leftover critical save dice
					if(crit < 0)
					{
						miss += scrit + crit; 	// Increase miss by the number of save dice that reduced crit to zero
						hit += crit;		// Use leftover critical saves to neutralize hits. Reduce hits by adding the negative crits
						crit = 0;               // Zero out crit as all have been neutralized
						scrit = 0;		// Zero out scrit, as all have been used
					}
					else
					{
						miss += scrit;		// Crits turned into misses
						scrit = 0;		// Zero out scrit, as all have been used
					}
				}
				else
				{
					// Crit saves prioritize saving normal hits, then crits
					// Test if the total save dice pool is greater than total hits and crits
					// This makes sure critical saves will be used on crits if there are enough normal save dice to neutralize all hits
					if(shit < hit && scrit > 0)
					{
						scrit -= (hit - shit); // Reduce crit saves by the difference between normal saves and normal hits
						
						// See if there is any leftover critical dice = all hits are saved by now
						if(scrit >= 0)
						{
							miss += hit;	// If yes, add all hits to miss
							hit = 0; 	// Reduce hits to zero.
							
							// Use the remaining critical save pool to reduce crits
							if(crit - scrit >= 0)
							{
								crit -= scrit;
								miss += scrit;
								scrit = 0;
							}
							else
							{
								miss += crit;
								crit = 0;
								scrit = 0;
							}		
						}
						// There aren't enough crit saves to save all remaining hits
						else
						{
							hit += scrit; 	// Note: scrit is now a negative amount
							miss -= scrit;  // Increase misses by the same amount
							scrit = 0;	// Zero out critical saves
						}	
					}	
				}
				
				// See if there is a remaining crit and at least 2 normal save dice
				if(crit > 0 && shit >= 2)
				{
					// Test if neutralizing crits with 2 save dice makes rational sense:
					// - If a crit damage is higher than 2 normal hits
					// - If there is maximum 1 hit to be saved, and crits have higher or equal damage
					if(attacker.damageCrit > attacker.damageHit*2 || ( hit <= 1 && attacker.damageCrit >= attacker.damageHit))
					{
						crit -= Math.floor(shit/2);	// Math operation necessary, because 2 normal saves are required to neutralize 1 crit
						miss += Math.floor(shit/2);     // The operation will result in 1 even if shit = 3
						shit -= Math.floor(shit/2)*2;   // Reduce normal hit save pool by twice the amount crit was reduced with
						
						// Currently impossible in Kill Team, but in case there were 4 normal save dice and only 1 crit, then crit turns negative
						if(crit < 0)
						{
							shit -= crit*2;		// Add back the unused normal save dice to the pool
							crit = 0;
						}
					}
				}
				
				// Use normal saves to reduce normal hits
				hit -= shit;
				if(hit >= 0)
				{
					miss += shit;
					shit = 0;
				}
				else
				{
					miss += hit + shit;
					hit = 0;
				}
			}
			
			// Build the new array object
			if(typeof outputMatrix[miss + "|" + hit + "|" + crit] === 'undefined')
			{
				combination = new combinationObject();
				combination.p = inputMatrix[key1].p * saveRollMatrix[key2].p;	// Weigh attack combination probabilities with save probabilities
				combination.miss = miss;
				combination.hit = hit;
				combination.crit = crit;
				combination.mw = inputMatrix[key1].mw;
				
				outputMatrix[miss + "|" + hit + "|" + crit] = combination;
				
			}	
			else
			{
				outputMatrix[miss + "|" + hit + "|" + crit].p += inputMatrix[key1].p * saveRollMatrix[key2].p;
			}
		}
	}
	
	return outputMatrix;	
}







/* DAMAGE CALCULATIONS

   Further consolidate the probability matrix into a damage matrix 
   where all distinct damage outcomes are assigned probability values
   Object template: {p:0, cp:0, dmg, wdmg}
*/

class damageProbabilityObject
{
	constructor(pObject, attacker)
	{
		this.p = pObject.p;
		this.cp = 0;									// Cumulative probabilty
		this.dmg = pObject.hit*attacker.damageHit + pObject.crit*attacker.damageCrit + pObject.mw;	// Total damage
		this.wdmg = this.p*this.dmg;							// Total damage weighted by probability
	}
}

var damageProbabilityMatrix = function(pMatrix, attacker)
{
	dMatrix = new Array();
	  
	for(const key in pMatrix)
  	{
  		// For damage object array array keys will be total damage numbers
  		dPObject = new damageProbabilityObject(pMatrix[key], attacker);
		if (typeof dMatrix[dPObject.dmg] === 'undefined')
		{
			// If the particular damage value is not added yet, add it
			dMatrix[dPObject.dmg] = dPObject;
		}
		else
		{
			// If the particular damage value is already added, just cumulate the probability
			dMatrix[dPObject.dmg].p += dPObject.p;
		}	
	}
	
	// Sort the object array by damage, ascending
	dMatrix.sort((a,b) => a.dmg - b.dmg);
	
	// Calculate cumulative probabilities ("y probability to do x damage or more")
	cumulativeProbability = 1;
	
	for(const key in dMatrix)
  	{	
  		dMatrix[key].cp = cumulativeProbability;
  		cumulativeProbability -= dMatrix[key].p;
  	}
	
	return dMatrix;	
}



// DAMAGE CHART
// Use CanvasJS to draw data in a chart
class damageChart
{
	constructor()
	{
		this.chartData = 0;
	}
	
	updateChart(dMatrix, attacker, target){
		var dataPoints = new Array();
		var dead = 0;
		for(const key in dMatrix)
  		{
  			if(target.w <= dMatrix[key].dmg && dead != 1)
  			{
  				dataPoints.push({label: dMatrix[key].dmg, x: dMatrix[key].dmg, y: dMatrix[key].cp, indexLabel: "KILL BREAKPOINT", indexLabelFontColor: "#c54c21"});
  				dead = 1;
  			}
  			else
  			{
  				dataPoints.push({label: dMatrix[key].dmg, x: dMatrix[key].dmg, y: dMatrix[key].cp});
			}	
		}
		
		var id = new Date; 
		id = id.getTime();
		
		this.chartData = { type: "stepArea", lineColor:"#465f65", color:"#465f65", fillOpacity:0.5, showInLegend: true, name: attacker.weaponName, dataPoints: dataPoints, id: id};		
	}
	
	plotChart(){
		var chart = new CanvasJS.Chart("chartContainer",
		{
			title:{ text: "Total damage probabilities" },   
	                animationEnabled: true,
			exportEnabled: true,  
			axisY:{ 
				title: "Probability",
				includeZero: true,
				interval: 0.1,
				minimum: 0,
				maximum: 1,
				gridColor: "#cccccc",
				gridThickness: 1                    
			},
			axisX: {
				title: "Total attack damage equal or higher than",
				minimum: 0,
				gridColor: "#cccccc",
				gridThickness: 1, 
				interval: 1
			},
			legend: {
				horizontalAlign :"center"
			},
			data: [this.chartData]
	          
		});
		
		chart.render();
	}
}

// Pre-defined weapon templates. HTML will be automatically populated.
class weaponProfileObject
{
	constructor(a, bsx, damageHit, damageCrit, apx, lethalx, px, mwx, splash, balanced, ceaseless, relentless, rending)
	{
		this.a = a;
		this.bsx = bsx;
		this.damageHit = damageHit;
		this.damageCrit = damageCrit;
		this.apx = apx;
		this.lethalx = lethalx;
		this.px = px;
		this.mwx = mwx;
		this.splashx = splash;
		this.balanced = balanced;
		this.ceaseless = ceaseless;
		this.relentless = relentless;
		this.rending = rending;
	}	
}