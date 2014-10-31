var oQuiz;

function logBinary(label, bin) {
    var sB = bin.toString(2);
    var sBin = ("00000000"+sB).slice(-8);
    //console.log(label, sBin);
    return sBin;
}
    
function bitCount(b)
{
    var sB = b.toString(2);
    var re = /1/g;    
    var xRes = sB.match(re);
    if($.isArray(xRes))
    {
        return xRes.length;
    }
    return 0;
}


$( document ).ready(function() {
    // TODO : add is 8 bit overflow tick box
    
    // TODO : Refactor all the checking etc. into the question, oQuiz just displays it.
    // TODO : Add alternative input method (text box with letter spacing and RTL)
    // TODO : Event lisenters for 0,1,c (carry), ENTER (subtle cursor )
    // TODO : Mark the carrying as well and give extramarks for that (we are looking at these in the hinting so far)
    
    // TODO : Add marks and stats to oQuiz
    // DEBUG : Display Running stats (score)
    
    // DONE : Add finish page
    
    // TODO : Add exam mark scheme to questions and score on that.
    // DONE : Add print out homework (which prints each oth the questions as an exam layout question)
    
    
    // TODO : save progress locally and enable reloading
    // TODO : Add Teacher feedback message (email / scorm / TinCan or server message)
    // DONE : TinCan in progress
    // TODO : Tidy up and more jQuery it
    // TODO : Integrate with other question types
    // TODO : test on the MS surfaces
    var tincan = false;
    if (TinCanRecordStores.length)
    {
        tincan = new TinCan (
            {
                recordStores: TinCanRecordStores
            }
        );
    }
    
    
    var defaultStatement = {
        actor: {
            mbox: ""
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/initialized",
            "display": {"en-GB": "initialised"}
            /*http://adlnet.gov/expapi/verbs/passed
            http://adlnet.gov/expapi/verbs/failed
            http://adlnet.gov/expapi/verbs/progressed*/
        },
        target: { //Object ???
            id: "http://learning.edumake.org/binary-addition/",
            type: "http://adlnet.gov/expapi/activities/assessment",
            definition: {
                name: { "en-GB": "Binary Addition Quiz" }
            }
        }
    };
    
    
    if(localStorage.getItem("tincan_mbox")){
        defaultStatement.actor.mbox = localStorage.getItem("tincan_mbox");
    }    
        
    if(defaultStatement.actor.mbox.length) {
        tincan.sendStatement(defaultStatement);
    }
    
    var cQuestion = {
        iQuestion:0,
        iLine1:0,
        iLine2:0,
        iAnswer:0,
        iAttempts:0,
        type:"none",
        aScorers:[
            {
                name:"default",
                weight:1,
                exam:1,
                getScore:function(oQ) {
                    return 1;
                }
            }
        ],
    
        make:function(){
            this.iLine1 = Math.round(Math.random()*255);
            this.iLine2 = Math.round(Math.random()*255);
            
        },
        calcValue:function(){
            var aScores = this.aScorers.map(function(oScorer){
                    return oScorer.getScore(this) * oScorer.weight;
            }, this);
            
            var iValue = aScores.reduce(function(previousValue, currentValue, index, array){
              return previousValue + currentValue;
            });
            this.iValue = iValue;
            return iValue;
        },
        
        genDetails:function(iPos){
            this.iQuestion = iPos;
            this.iAnswer = this.iLine1 + this.iLine2;
            this.aLine1 = this.getAsBinaryArray(this.iLine1);
            this.aLine2 = this.getAsBinaryArray(this.iLine2);
        },
        
            
        getAsBinaryArray:function(iNum){
            var aLine2 = ["0","0","0","0","0","0","0","0"];
            
            var sLine = iNum.toString(2);
            var aLine = sLine.split("");
            var iMaxLinePos = aLine.length - 1;
            
            for(var i = 0 ; i < aLine.length; i++)
            {
                aLine2[7-i] = aLine[iMaxLinePos-i];
            }
            return aLine2;
            
        },
        renderLine: function(eTR, iNumber)
        {
            var sLine = iNumber.toString(2);
            var aLine = sLine.split("");
            var iMaxLinePos = aLine.length -1;
            
            for(var i = 0 ; i < 9; i++)
            {
                eTR[i].innerHTML = "0";
                
            }
            eTR[0].innerHTML = "&nbsp";
            
            for(i = 0 ; i < aLine.length; i++)
            {
                eTR[8-i].innerHTML = aLine[iMaxLinePos-i];
            }
        }
    };
    
    var cSumQuestion = jQuery.extend(cQuestion,{
        type:"binaryaddition",
        oWeight:{
            xor:      1,
            carry:    10,
            second:   30,
            three:    65,
            overflow: 140
        },
        
        oExamMark:{
            xor:     1,
            carry:   1,
            second:  1,
            three:   1,
            overflow:1
        },
        
        getAppearances:function()
        {
            var x = this.iLine1;
            var y = this.iLine2;
            
            
            var orgAnds = x & y;
            var carry = 0;
            var step = 0 ;
            var three = 0;
            
            var aAppearances = {
                xor:   0,
                carry: 0,
                second:0,
                three: 0,
                overflow:0
            };
            
            while(y !== 0)
            {
                carry = x & y;
                x = x ^ y;
                
                if(step)
                {    
                    aAppearances.three += bitCount(orgAnds & y);
                    aAppearances.second += bitCount(carry);
                }
                else
                {
                    aAppearances.xor = bitCount(x);
                    aAppearances.carry = bitCount(carry);
                }
                y = carry << 1;
                step ++ ;
            }
            //logBinary("add x  =", x);
            if(x > 255) {
                aAppearances.overflow = 1;
            } 
            //console.log("aAppearances =", aAppearances);
            return aAppearances;
        },
        calcValue:function(){
            var aAppearances = this.getAppearances();
            var iValue = 0;
            var iExam = 0;
            
            for (sType in this.oWeight) {
                //console.log("sType =", sType, aAppearances[sType]);
                iValue += this.oWeight[sType] * aAppearances[sType];
                iExam += this.oExamMark[sType] * (aAppearances[sType]?1:0);
            }                   
                
            this.iValue = iValue;
            this.iExam = iExam;
            return iValue;
        }
    });
    
    oQuiz = {
        aQuestions:[],
        iCurrentQuestion:0,
        iCurrentScore:0,
        iCurrentMin:2,
        iCurrentMax:5,
        
        iMinDifficulty: 2,
        iMaxDifficulty: 200,
        
        nextQuestion:function(){
            var iValue = 0;
            var iTry = 0;
            var oQuestion = Object.create(cSumQuestion);
            do {
                oQuestion.make();
                iValue = oQuestion.calcValue();
                
                iTry ++;
            } while(iTry < 10000 && !(this.iCurrentMin <= iValue && iValue <= Math.min(this.iCurrentMax, this.iMaxDifficulty )));
            
            if(iTry === 10000)
            {
                console.log("Limit Reached");
            }
            
            /*var aApp = oQuestion.getAppearances();
            console.log("aApp =", aApp);
            oQuestion.calcValue();
            console.log("nextQuestion this.iCurrentMin =", this.iCurrentMin);
            console.log("nextQuestion this.iCurrentMax =", this.iCurrentMax);
            */
            
            this.iCurrentQuestion ++;
            oQuestion.genDetails(this.iCurrentQuestion);
            
            this.aQuestions.push(oQuestion);    
            this.oQuestion = oQuestion;
            //console.log("nextQuestion oQuestion.iValue =", oQuestion.iValue);
            
            return oQuestion;
        },
        
        setOutput: function($eOut)
        {
            this.$eOut = $eOut;
            this.eSumline1 = this.$eOut.find(".sumline1>td");
            this.eSumline2 = this.$eOut.find(".sumline2>td");
            this.eSumAnswer = this.$eOut.find(".sumresult>td");
            this.eSumCarry = this.$eOut.find(".sumcarry>td");
        },
        
        // TODO : Refactor into cQuestion
        renderLine: function(eTR, iNumber)
        {
            this.oQuestion.renderLine(eTR, iNumber);
        },
        
        renderQuestion: function()
        {
            this.$eOut.removeClass();
            this.$eOut.find("td").removeClass();
            
            $(".sumnextquestion").hide();
            $(".sumcheck").show();
            
            $(".sumhint").hide();
            
            $("#questionnumber").html(this.oQuestion.iQuestion);
            
            // TODO : Refactor into cSumQuestion
            this.renderLine(this.$eOut.find(".sumline1>td"), this.oQuestion.iLine1);
            this.renderLine(this.$eOut.find(".sumline2>td"), this.oQuestion.iLine2);
            
            var eTR = this.$eOut.find(".sumresult>td");
            var eTR2 = this.$eOut.find(".sumcarry>td");
            for(var i = 0 ; i < 9; i++)
            {
                eTR[i].innerHTML = "&nbsp;";
                eTR2[i].innerHTML = "&nbsp;";
                $(eTR[i]).removeClass("sumincorrectcell");
                $(eTR2[i]).removeClass("sumincorrectcell");
            }
            // End Refactor
        },
        
        // TODO : Refactor into cQuestion
        getIntValueFromTR:function getIntValueFromTR($jEles,bStrict){
            var aData = jQuery.makeArray($jEles.map(function(indx,ele){
                return ele.innerHTML;
            }));
            var bComplete = true;
            
            if(aData[0] === "&nbsp;")
            {
                aData[0] = "0";
            }
            
            if(bStrict && aData.some(function(xItem){return xItem === "&nbsp;";}))
            {
                bComplete = false;
            }
            
            var aAnswers = aData.map(function(xItem){return xItem === "&nbsp;"?"0":xItem;});
            var iNumber = parseInt(aAnswers.join(""), 2);
            return {"iNumber":iNumber, "bComplete":bComplete };
        },
    
        showMessage:function(sMsg, sClass){
            $(".sumfeedback").show();
            $(".sumfeedback").html(sMsg).addClass(sClass);
            
        },
        
        removeMessage:function(){
            $(".sumfeedback").html("").removeClass("sumincorrect sumcorrect sumwarning");
            $(".sumfeedback").hide();
            clearTimeout(this.iCurrTimer); 
        },
        
        onHint:function( evt){
            // TODO : Refactor into cSumQuestion
            // TODO : (use makeNoharder afterwards)
            var iRightmostError = 9;
            
            do{
                
                iRightmostError --;
                
                var iA = $(this.eSumline1[iRightmostError]).html() === "1"?1:0;
                var iB = $(this.eSumline2[iRightmostError]).html() === "1"?1:0;
                var iC = $(this.eSumCarry[iRightmostError]).html() === "1"?1:0;
                var iO = $(this.eSumAnswer[iRightmostError]).html() === "1"?1:0;
                var iOC = $(this.eSumCarry[iRightmostError-1]).html() === "1"?1:0;
                
                var sHint = "";
                
                var bInvolvesCarryIn = false;
                var bInvolvesCarryOut = false;
                
                if((iA + iB + iC) === 0 && !iO && iOC)
                {
                    bInvolvesCarryIn = true;
                    bInvolvesCarryOut = true;
                    sHint = "There should be nothing to carry from this column"; 
                }
                
                if((iA + iB + iC) === 0 && iO)
                {
                    bInvolvesCarryIn = true;
                    sHint = "What have you added up?";
                }
                
                if((iA + iB) === 0 && iC && !iO)
                {
                    bInvolvesCarryIn = true;
                    sHint = "Remember to add in the 1 you have carried into this column";
                }
                
                if((iA + iB) === 1 && iC === 0  && !iO && !iOC)
                {
                    sHint = "Add up this column";
                }
                
                if((iA + iB + iC) === 2  && !iO && !iOC)
                {
                    bInvolvesCarryIn = true;
                    bInvolvesCarryOut = true;
                    sHint = "1+1=2 which is 10 in binary, so we carry that 1 to the left and keep the 0 in the Answer for this column";
                }
                
                if((iA + iB + iC) === 1 && iOC)
                {
                    bInvolvesCarryIn = true;
                    bInvolvesCarryOut = true;
                    sHint = "There is nothing to carry from this column";
                }
                
                if((iA + iB + iC) === 2  && iO && !iOC)
                {
                    bInvolvesCarryIn = true;
                    bInvolvesCarryOut = true;
                    sHint = "1+1=2 which is 10 in binary, so we carry that 1 to the left and keep the 0 in this column";
                }
                
                if((iA + iB + iC) === 2  && iO && iOC)
                {
                    bInvolvesCarryIn = true;
                    sHint = "1+1=2 which is 10 in binary, so we carry that 1 to the left and keep the 0 in this column";
                }
                
                if((iA + iB + iC) === 3 && !iO && !iOC)
                {
                    bInvolvesCarryIn = true;
                    sHint = "1+1+1=3 which is 11 in binary, so we carry 1 to the left and keep 1 in this column";
                }
                
                if((iA + iB + iC) === 3 && !iO && iOC)
                {
                    bInvolvesCarryIn = true;
                    sHint = "1+1+1=3 which is 11 in binary, so we carry 1 to the left and keep 1 in this column";
                }
                
                if((iA + iB + iC) === 3 && iO && !iOC)
                {
                    bInvolvesCarryIn = true;
                    bInvolvesCarryOut = true;
                    sHint = "1+1+1=3 which is 11 in binary, so we carry 1 to the left and keep 1 in this column";
                }
                //console.log("sHint =", sHint);
                
            } while (iRightmostError >= 0 && sHint === "");
            
            if(sHint)
            {
                this.$eOut.find("td").removeClass();
                $(this.eSumline1[iRightmostError]).addClass("sumhighlight");
                $(this.eSumline2[iRightmostError]).addClass("sumhighlight");
                $(this.eSumAnswer[iRightmostError]).addClass("sumhighlight");
                if(bInvolvesCarryIn)
                {
                    $(this.eSumCarry[iRightmostError]).addClass("sumhighlight");
                }
                if(bInvolvesCarryOut)
                {
                    $(this.eSumCarry[iRightmostError - 1]).addClass("sumhighlight");
                }
                
                this.showMessage(sHint, "sumwarning");
            }
        },
        
        // TODO : Refactor into cSumQuestion
        onHighlightErrors:function( evt){
            // Using hinting instead of error highlighting, but keep the code
            var oRes = this.getIntValueFromTR($(".sumresult>td"),true);
            var iResNumber = oRes.iNumber;
            var iNumber = iResNumber ^ (this.oQuestion.iLine1 + this.oQuestion.iLine2);
            var sLine = iNumber.toString(2);
            var aLine = sLine.split("");
            var iMaxLinePos = aLine.length -1;
            
            var eCell = null;
            var eTR = this.$eOut.find(".sumresult>td");
            for(var i = 0 ; i < aLine.length; i++)
            {
                if(aLine[iMaxLinePos-i] === "1")
                {    
                    eCell = $(eTR[8-i]);
                    if(eCell.html() !== "&nbsp;")
                    {
                        eCell.addClass("sumincorrectcell");
                    }
                }
            }
            
            this.oQuestion.iAttempts =+ 2;
        
        },
        
        onCheckAnswer:function( evt ){
            this.$eOut.find("td").removeClass();
            
            // TODO : Refactor into cSumQuestion
            // Should return a passed / failed / nearly, a message and a next step? 
            var oRes = this.getIntValueFromTR($(".sumresult>td"),true);
            var iResNumber = oRes.iNumber;
            var bResult = (iResNumber === (this.oQuestion.iLine1 + this.oQuestion.iLine2));
            
            this.oQuestion.iAttempts ++;
            
            if(bResult)
            {
                if (oRes.bComplete === false)
                {
                    this.oQuestion.iAttempts --;
                    $(".sumcheck").hide();
                    $("#sumzerofill2").show();
                    this.showMessage("Nearly: just need to fill in the  missing 0's", "sumwarning");
                    return true;
                }
                
                this.showMessage("Well Done", "sumcorrect");
                $(".sumnextquestion").show(); 
                $(".sumcheck").hide();
                
                this.iCurrTimer = setTimeout(function(){oQuiz.onNextQuestion();},5000);
                this.iCurrentScore = this.iCurrentScore + Math.floor(this.oQuestion.iValue / this.oQuestion.iAttempts);
                //console.log("onCheckAnswer this.oQuestion.iValue =", this.oQuestion.iValue);
                //console.log("onCheckAnswer this.oQuestion.iAttempts =", this.oQuestion.iAttempts);
                //console.log("onCheckAnswer this.iCurrentScore =", this.iCurrentScore);
                
                $(".sumcompleted").html(this.iCurrentScore);
                $(".sumscore").html(this.iCurrentScore);
            }
            else if(this.oQuestion.iAttempts > 4)
            {
                this.showMessage("You  seem to be struggling, try this one.", "sumwarning");
                this.iCurrTimer = setTimeout(this.removeMessage,5000);
                this.makeEasier();            
                oQuiz.nextQuestion();
                oQuiz.renderQuestion();
            }
            else
            {
                this.showMessage("Incorrect!", "sumincorrect");
                this.iCurrTimer = setTimeout(this.removeMessage,5000);
                $(".sumhint").show();
            }
        },
        
        makeHarder:function()
        {
            //this.iCurrentMin = Math.min(this.oQuestion.iValue+1, Math.floor(this.iMaxDifficulty * 0.9));
            //console.log("makeHarder this.oQuestion.iValue =", this.oQuestion.iValue);
            var fEase = Math.max(0.2, 1 / this.oQuestion.iAttempts);
            //console.log("makeHarder fEase =", fEase);
            //this.iCurrentMax = Math.min(Math.ceil(Math.min(this.iMaxDifficulty/10, (fEase* this.iCurrentMax))+this.oQuestion.iValue), this.iMaxDifficulty);
            this.iCurrentMax = Math.min(Math.ceil(Math.min(this.iMaxDifficulty/10, (fEase* this.oQuestion.iValue))+this.oQuestion.iValue), this.iMaxDifficulty);
            this.iCurrentMin = Math.max(this.oQuestion.iValue + 1, Math.floor(this.iCurrentMax * 0.8));            
            console.log("makeHarder this.iCurrentMin =", this.iCurrentMin);
            console.log("makeHarder this.iCurrentMax =", this.iCurrentMax);
        },
        
        makeNoHarder:function()
        {
            this.iCurrentMax = Math.min(this.oQuestion.iValue, this.iMaxDifficulty); 
            console.log("makeNoHarder this.iCurrentMax =", this.iCurrentMax);
        },
        
        makeEasier:function()
        {
            var fEase = Math.max(0, 1-(0.3 * this.oQuestion.iAttempts));
            this.iCurrentMax = Math.ceil(Math.max(this.oQuestion.iValue*fEase, Math.floor(this.iMinDifficulty * 1.5)));
            this.iCurrentMin = Math.ceil(Math.max(this.oQuestion.iValue*(fEase-0.1), Math.floor(this.iMinDifficulty)));
            console.log("makeEasier this.iCurrentMin =", this.iCurrentMin);
            console.log("makeEasier this.iCurrentMax =", this.iCurrentMax);
        },
        
        onSkipQuestion:function( evt ){
            //this.makeNoHarder();            
            this.makeEasier();            
            oQuiz.nextQuestion();
            oQuiz.renderQuestion();
        },
        
        onEndQuiz:function( evt ){
            var source   = $("#entry-template").html();
            var iRawScore = this.iCurrentScore;
            //console.log("this =", this);
            
            var aPaperAnswers = this.aQuestions.map(function(val, ind){
                    
                var sAns = logBinary((ind+1).toString()+") ", val.iAnswer);
                //console.log("sAns =", sAns);
                return sAns;
            });
            
            //console.log("aPaperAnswers =", aPaperAnswers);
            
            //console.log("iRawScore =", iRawScore);
            var iScaledScore = Math.round((this.iCurrentMax / this.iMaxDifficulty) * 100)/ 100;
            //console.log("iScaledScore =", iScaledScore);
            var bSuccess = (iScaledScore > 0.50);
            //console.log("bSuccess =", bSuccess);
            var bCompletion = (this.iCurrentQuestion >= 10);
            //console.log("bCompletion =", bCompletion);
            
            var endStatement = defaultStatement;    
            endStatement.verb = {
                 "id": "http://adlnet.gov/expapi/verbs/completed",
                 "display": {"en-GB": "completed"}
            };
    
            endStatement.result = {
                "completion": bCompletion,
                "success": bSuccess,
                "score": {
                    "scaled": iScaledScore,
                    "raw" : iRawScore
                },
                "extensions": {
                    "http://www.edumake.org/paperquiz/binaryanswers": aPaperAnswers
                }
            };
            
            //console.log("endStatement =", endStatement);
            if(defaultStatement.actor.mbox.length) {
                tincan.sendStatement(endStatement);
            }
            
            var template = Handlebars.compile(source);
            var context = this;
            console.log("context =", context);
            var html    = template(context);
            var sURL =  "data:text/html;base64," + btoa(html);
            
            $(".quizholder").html("<h2>Thank you</h2><p>Your paper home work should have opened automatically for you to print out. If it hasn't click <a target=\"_blank\" href=\""+sURL+"\">here</a>.</p>");
            $(".explaination").hide();
            
            window.open(sURL,'_blank');
            //$("#dump").html(html);
        },
        
        // TODO : oQuiz should ask oQuestion if this is needed
        onZeroFill:function( evt ){
            var oEmpty = $(".sumresult>td").filter(function(indx,ele){
                return ele.innerHTML === "&nbsp;";
            });
            oEmpty.html("0");
            
            if ($(".sumresult>td:first").html() === "0")
            {
                $(".sumresult>td:first").html("&nbsp;");
            }
            this.removeMessage();
            $("#sumzerofill2").hide();
            $(".sumcheck").show();
            this.onCheckAnswer();
        },
        
        onNextQuestion:function( evt ){
            clearTimeout(this.iCurrTimer); 
            this.removeMessage();
            this.makeHarder();            
            oQuiz.nextQuestion();
            oQuiz.renderQuestion();
        }
    };
    
    oQuiz.nextQuestion();
    oQuiz.setOutput($("#questionholder"));
    oQuiz.renderQuestion();
    
    
    // TODO add add binary click input class to the html and use that for this
    $(".sumresult>td").click(function( evt ){
        var sCurrHTML = $(evt.target).html();
        switch(sCurrHTML)
        {
            case "1":
                $(evt.target).html("0");
                break;
            case "0":
                $(evt.target).html("1");
                break;
            case "&nbsp;":
                $(evt.target).html("1");
                break;
        }
    });
    
    $(".sumcarry>td").click(function( evt ){
        var sCurrHTML = $(evt.target).html();
        switch(sCurrHTML)
        {
            case "1":
                $(evt.target).html("&nbsp;");
                break;
            case "&nbsp;":
                $(evt.target).html("1");
                break;
        }
    });
    
    $(".sumcheck").click(function(evt){return oQuiz.onCheckAnswer(evt);});
    $(".sumskip").click(function(evt){return oQuiz.onSkipQuestion(evt);});
    $(".sumend").click(function(evt){return oQuiz.onEndQuiz(evt);});//.hide();
    $(".sumzerofill").click(function(evt){return oQuiz.onZeroFill(evt);});//.hide();
    $(".sumnextquestion").click(function(evt){return oQuiz.onNextQuestion(evt);}).hide();
    //$(".sumhighlight").click(function(evt){return oQuiz.onHighlightErrors(evt);}).hide();
    $(".sumhint").click(function(evt){return oQuiz.onHint(evt);}).hide();
    
});
