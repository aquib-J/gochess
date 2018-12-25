
// Once pgn file is uploaded store all loaded games
var jsonGames = "";

function analyzeGameById(gameID){
    $.ajax({
        url: 'gameAnalysisById',
        type: 'post',
        dataType: 'html',
        data : { 'id': gameID, 'depth': document.getElementById('depthspinbox').value},
        success : function(data) {			
            analyzeGames(data);
        }	
    });
}

function analyzeGameByPgn(pgnData){
    $.ajax({
        url: 'gameAnalysisByPgn',
        type: 'post',
        dataType: 'html',
        data : { 'pgnData': pgnData, 'depth': document.getElementById('depthspinbox').value},
        success : function(data) {	
            console.log(data)
            analyzeGames(data);
        }	
    });
}

// Analyzes already stored game from scanned pgn file
function analyzeGame(moves){
    
    board.position('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

    var analysisTable = `Analysis:<br> <table class="table3" id="engineTable">
        <tr>
        <th>Move #</th><th>Played Move</th><th>Best Move</th>
        </tr>
    </table>`;

    document.getElementById('analysis').innerHTML = analysisTable;
    var engineTable = document.getElementById("engineTable");
    
    for(var i=1; i<moves.length; ++i){
        var move = game.move({
            from: moves[i].PlayedMoveSrc,
            to: moves[i].PlayedMoveTar,
            promotion: moves[i].PlayedMovePromotion 
        });

        // Construct engine analysis table
        $('#engineTable').html(function() {
            return  $(this).html() + '<tr  onclick="goToMove(' + i + ');"><td>'+ i + '.</td><td>' + moves[i].PlayedMoveSrc + 
                moves[i].PlayedMoveTar + moves[i].PlayedMovePromotion +'</td><td>' + 
                moves[i].BestMoveSrc + moves[i].BestMoveTar + moves[i].BestMovePromotion +
                '</td></tr>';
        });

        if (move !== null){
            var gameFen = moves[i].PlayedMoveFen;
            board.position(gameFen);
            totalFEN.push(gameFen);
            var pgn = game.pgn();
            totalPGN.push(pgn);
            ++moveCounter;
        }else{
            console.log("Null move for:");
            console.log(i, moves.length);
        }
    }
}

function analyzeGameByIndex(index){
    if(jsonGames !== ""){
        analyzeGame(analyzedGames[index].Moves);
    }else{
        console.log("Please upload a PGN or specify a game ID to load.");
    }
}

// Used to load initial games into cache if there are multiple games scanned from pgn
function analyzeGames(data){
    
    board.position('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

    var analysisTable = `Analysis:<br> <table class="table3" id="engineTable">
        <tr>
        <th>Played Move</th><th>Best Move</th>
        </tr>
    </table>`;

    document.getElementById('analysis').innerHTML = analysisTable;

    var analyzedGames = JSON.parse(data);
    jsonGames = analyzedGames
    console.log(analyzedGames);
    var moves = analyzedGames.Moves;

    if (typeof analyzedGames !== 'undefined' && analyzedGames.length > 0) {
        // then there is multiple games being analyzed
        moves = analyzedGames[0].Moves
    }
    analyzeGame(moves); 
}

// When a row is clicked on the analysis engine table the board will update according to the row clicked
function goToMove(row){
    board.position(totalFEN[row]);	
    setPGN(totalPGN[row]);
    moveCounter = row;
    makeTableRowGreen(row);
}

function makeTableRowGreen(rowNum){
    var engineTable = document.getElementById("engineTable");
    for (var i = 0, row; row = engineTable.rows[i]; i++) {
        if (i === rowNum){
            row.style.backgroundColor = "#C1FFC1"; 
        }else if(row.style.backgroundColor !== "white"){
            row.style.backgroundColor = "white"; 
        }
    }
}

if (document.getElementById('uploadPGN') !=null){
    document.getElementById('uploadPGN').onclick = function() {
        for(var i=0; i<document.getElementById("pgnFiles").files.length; ++i){
            (function(index) { 
                var file = document.getElementById("pgnFiles").files[index];
                console.log(file);
                if (file) {
                    var reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        if(isValidPGN(evt.target.result)){
                            analyzeGameByPgn(evt.target.result);
                        }else{
                            document.getElementById('textbox').innerHTML += 
                                (timeStamp() + " Invalid PGN at index " + i + " in file: " + file.name + '\n');
                        }
                    }
                    reader.onerror = function (evt) {
                        console.log("error reading file");
                    }
                }
            })(i);
        }
    }
}

// Returns true if file is a valid pgn
function isValidPGN(pgnData){
    try {
        var chess = jQuery('#pgn-validator').chess({pgn : pgnData});
        console.log(chess);
        return true;
    }catch(error){
        console.log(error);
        return false
    }
    
}

function handleFiles(files){
    console.log(files);
}

function timeStamp(){
	var currentdate = new Date(); 
	var datetime =  + currentdate.getHours() + ":"  
              			+ currentdate.getMinutes() + ":" 
              			+ currentdate.getSeconds();
	return datetime;
}