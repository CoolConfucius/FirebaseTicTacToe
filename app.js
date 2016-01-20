'use strict'; 
$(document).ready(init); 

var ref = new Firebase('https://tictactoe2016.firebaseio.com/');
var playersRef = ref.child('players')
var player; 
var obj = {};  


function init() { 
  ref.child('state').on('value', function(snap) {    
    if (!snap.val()) {
      ref.child('state').set('lobby');
      obj.state = 'lobby';
    } else {
      obj.state = snap.val(); 
    }
  }); 

  ref.child('turn').on('value', function(snap){
    if (snap.val()) {
      obj.turn = snap.val()
      $('#display').text(obj.turn + "'s turn");
    };
  });

  ref.child('tiles').on('value', function(snap){
    if (!snap.val()) {
      ref.child('tiles').set({
        t0: '', t1: '', t2: '', 
        t3: '', t4: '', t5: '', 
        t6: '', t7: '', t8: ''
      });
    } else {
      updateTiles(); 
    }
  });

  ref.child('moves').on('value', function(snap){
    if (snap.val()) { obj.moves = snap.val(); };
  })

  $('#submit').click(enterName);
  $('.tile').click(markTile); 

  // $('#play').click(startGame); 
  $('#game').on('click', '.tile',(markTile)); 
};

function enterName() {
  playersRef.once('value', function(snapshot){
    console.log(snapshot.val());
    if (!snapshot.val()) {
      playersRef.push($('#name').val() );
      player = 'p1'; // this is how you know which player you are.
    } else if( Object.keys(snapshot.val()).length === 1){
      playersRef.push($('#name').val() );
      player = 'p2';
      startGame(); 
    } else {
      return; 
    }
  });
}

function startGame(){
  if (obj.state === "lobby") {
    ref.child('state').set('game');
    ref.child('turn').set('p1');
    $('#display').text("p1's turn")
    obj.turn = "p1"; 
    ref.child('moves').set(0); 
  };
}

function markTile(){
  console.log("MARKTILE");
  if (obj.state !== "game") { return; };
  if (obj.turn !== player) {
    return; 
  };
  var $this = $(this);
  console.log("This, ", $this);
  var str = $this.attr('id'); 
  console.log(str, "String");
  ref.child('tiles').child(str).set(player); 
  ref.child('moves').transaction(function(oldVal){
    return oldVal + 1; 
  });
  
  updateTiles(); 

  if (obj.state === "game") {
    changeTurns(); 
  };
}






function updateTiles(){
  ref.child('tiles').on('value', function(snap){
    var board = snap.val(); 
    clearDom(); 
    $('#t0').text(board.t0); $('#t1').text(board.t1); $('#t2').text(board.t2);
    $('#t3').text(board.t3); $('#t4').text(board.t4); $('#t5').text(board.t5);
    $('#t6').text(board.t6); $('#t7').text(board.t7); $('#t8').text(board.t8);
    
    if (obj.moves >= 5) {
      console.log(win(obj.turn));
      if (win(obj.turn)) { 
        $('#display').text(obj.turn+" wins!");
        obj.state = "gameOver";
        ref.child('state').set('gameOver'); 
        ref.child('winner').set(obj.turn);
      } else if (obj.moves === 9){
        $('#display').text("It's a tie!");
        obj.state = "gameOver";
        ref.child('state').set('gameOver'); 
      }
    }; 

  })
}

function clearDom(){
  var str = '#t';
  for (var i = 0; i <= 8; i++) {
    $(str+i).text('');
  };
};

function changeTurns(){
  if (obj.turn === "p1") {
    obj.turn = "p2";
    $('#display').text("p2's turn");
  } else {
    obj.turn = "p1";
    $('#display').text("p1's turn");
  }
  ref.child('turn').set(obj.turn); 
};

var win = function(xo) {
  console.log("win?");
  var $t0 = $('#t0'); 
  var $t1 = $('#t1'); 
  var $t2 = $('#t2'); 
  var $t3 = $('#t3'); 
  var $t4 = $('#t4'); 
  var $t5 = $('#t5'); 
  var $t6 = $('#t6'); 
  var $t7 = $('#t7'); 
  var $t8 = $('#t8'); 
  return(
    check($t0, $t1, $t2, xo) || 
    check($t3, $t4, $t5, xo) || 
    check($t6, $t7, $t8, xo) || 
    check($t0, $t3, $t6, xo) || 
    check($t1, $t4, $t7, xo) || 
    check($t2, $t5, $t8, xo) || 
    check($t0, $t4, $t8, xo) || 
    check($t2, $t4, $t6, xo) 
    );
};

var check = function(t, t1, t2, xo){
  return (t.text()===xo && t1.text()===xo && t2.text()===xo);
};
