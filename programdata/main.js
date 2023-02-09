/**
 * Kill Team shooting probability calculator
 * (c)2023 Sándor Preszter - https://www.gnu.org/licenses/gpl-3.0.html
 * 
 * @author	Sándor Preszter <preszter.sandor@gmail.com>
 * @version	1.00
 * @since	2023-02-09 
 */
$(function(){

	$( document ).tooltip();

	damageChart = new damageChart();
	
	
	weaponTemplateListHTML = "";
	for(const key in weaponTemplateArray)
	{
		weaponTemplateListHTML += '<option value="'+key+'" '+((key == "Lasgun")? 'selected' : '')+'>'+key+'</option>';
	}
	$("#attacker_weaponName").html(weaponTemplateListHTML);
		
	$("#attacker_weaponName").on( "change", function()
	{
		weaponName = $("#attacker_weaponName").val();
		if(typeof weaponTemplateArray[weaponName] === undefined || weaponName.length < 1)
		{
		}
		else
		{
			$("#attacker_a option[value="+weaponTemplateArray[weaponName].a+"]").prop('selected', true);
			$("#attacker_bsx option[value="+weaponTemplateArray[weaponName].bsx+"]").prop('selected', true);
			$("#attacker_damageHit option[value="+weaponTemplateArray[weaponName].damageHit+"]").prop('selected', true);
			$("#attacker_damageCrit option[value="+weaponTemplateArray[weaponName].damageCrit+"]").prop('selected', true);
			$("#attacker_apx option[value="+weaponTemplateArray[weaponName].apx+"]").prop('selected', true);
			$("#attacker_px option[value="+weaponTemplateArray[weaponName].px+"]").prop('selected', true);
			$("#attacker_lethalx option[value="+weaponTemplateArray[weaponName].lethalx+"]").prop('selected', true);
			$("#attacker_mwx option[value="+weaponTemplateArray[weaponName].mwx+"]").prop('selected', true);
			$("#attacker_splashx option[value="+weaponTemplateArray[weaponName].splashx+"]").prop('selected', true);
			$("#attacker_balanced").prop('checked', weaponTemplateArray[weaponName].balanced);
			$("#attacker_ceaseless").prop('checked', weaponTemplateArray[weaponName].ceaseless);
			$("#attacker_relentless").prop('checked', weaponTemplateArray[weaponName].relentless);
			$("#attacker_rending").prop('checked', weaponTemplateArray[weaponName].rending);
		}
	}); 

	$("#dcalculate").on( "click", function()
	{

		// Populate attacker properties
		attacker = new attackerObject();
		attacker.weaponName = $("#attacker_weaponName").val(); 
		attacker.a = $("#attacker_a").val()*1; 
		attacker.bsx = $("#attacker_bsx").val()*1;
		attacker.damageHit = $("#attacker_damageHit").val()*1; 
		attacker.damageCrit = $("#attacker_damageCrit").val()*1; 
		attacker.apx = $("#attacker_apx").val()*1;
		attacker.px = $("#attacker_px").val()*1;
		attacker.lethalx = $("#attacker_lethalx").val()*1; 
		attacker.relentless = $("#attacker_relentless").prop('checked');
		attacker.ceaseless = $("#attacker_ceaseless").prop('checked'); 
		attacker.balanced = $("#attacker_balanced").prop('checked');
		attacker.rending = $("#attacker_rending").prop('checked');  
		attacker.mwx = $("#attacker_mwx").val()*1;
		attacker.splashx = $("#attacker_splashx").val()*1;
		attacker.cpreroll = $("#attacker_cpreroll").val()*1;
		
		// Populate target properties
		target = new targetObject();
		target.w = $("#target_w").val()*1;
		target.df = $("#target_df").val()*1;
		target.svx = $("#target_svx").val()*1;
		target.autosave = $("#target_autosave").val()*1;
		target.invulnerable = $("#target_invulnerable").prop('checked');
		
		// Generate dice roll result combinations
		cMatrix = new combinationMatrix(attacker.a, attacker.bsx, attacker.lethalx);
		// Calculate dice roll result probabilities
		pMatrix = new probabilityMatrix(cMatrix);
		// Adjust probabilities with special weapon attributes
		wsapMatrix = new weaponSpecialAdjustedProbabilityMatrix(pMatrix, attacker); 
		// Adjust probabilities with saves factored in
		sapMatrix = new saveAdjustedProbabilityMatrix(wsapMatrix, attacker, target);
		// Calculate distinct damage values with probabilities
		dMatrix = new damageProbabilityMatrix(sapMatrix, attacker);
	
		// Draw chart
		damageChart.updateChart(dMatrix, attacker, target);
		damageChart.plotChart();
	  	
	  	
	  	// Tab-separated value (TSV) output
	  	tsvoutput = "";
	  	
	  	tsvoutput += "+++ ROLL RESULT PROBABILITIES +++\n";
	  	tsvoutput += "Misses\tHits\tCrits\tProbability\n";
	  	for(const key in sapMatrix)
	  	{      
	  		tsvoutput += sapMatrix[key].miss+"\t"+sapMatrix[key].hit+"\t"+sapMatrix[key].crit+"\t"+sapMatrix[key].p+"\n";	
	  	}
	  	
	  	tsvoutput += "\n+++ DAMAGE PROBABILITIES +++\n";
	  	tsvoutput += "TotalDamageValue\tProbability\tCumulativeProbability\n";

		for(const key in dMatrix)
	  	{      
	  		tsvoutput += dMatrix[key].dmg+"\t"+dMatrix[key].p+"\t"+dMatrix[key].cp+"\n";	
	  	}		
			
		$("#output").val(tsvoutput);
		
		
	});

});