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
    if (snap.val() && obj.state === "game") {
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
      var board = snap.val(); 
      clearDom(); 
      $('#t0').text(board.t0); $('#t1').text(board.t1); $('#t2').text(board.t2);
      $('#t3').text(board.t3); $('#t4').text(board.t4); $('#t5').text(board.t5);
      $('#t6').text(board.t6); $('#t7').text(board.t7); $('#t8').text(board.t8);
      
      if (obj.moves >= 5) {
        console.log('obj:', obj);
        
        if (win(obj.turn)) { 
          obj.state = "gameOver";
          ref.child('state').set('gameOver'); 
          ref.child('postGame').set(obj.turn + "wins!");
        } 
        else if (obj.moves === 9){
          obj.state = "gameOver";
          ref.child('state').set('gameOver'); 
          ref.child('postGame').set("It's a tie!");
          obj.moves = 0; 
          ref.child('moves').set(0); 
        }
      }; 
      if (obj.state === "game") {
        changeTurns(); 
      };
    }
  });

  ref.child('moves').on('value', function(snap){
    if (snap.val()) { obj.moves = snap.val(); };
  })

  ref.child('postGame').on('value', function(snap){
    if (snap.val() && obj.state === "gameOver") { 
      $('#display').text(snap.val()); 
      $('#reset').show().click(reset); 
    };
  })

  $('#submit').click(enterName);
  $('.tile').click(markTile); 

  $('#game').on('click', '.tile',(markTile)); 
};

function enterName() {
  playersRef.once('value', function(snapshot){
    console.log(snapshot.val());
    if (!snapshot.val()) {
      playersRef.push($('#name').val() );
      player = 'X'; 
    } else if( Object.keys(snapshot.val()).length === 1){
      playersRef.push($('#name').val() );
      player = 'O';
      startGame(); 
    } else {
      return; 
    }
  });
}

function startGame(){
  if (obj.state === "lobby") {
    ref.child('state').set('game');
    ref.child('turn').set('X');
    $('#display').text("X's turn")
    obj.turn = "X"; 
    ref.child('moves').set(0); 
    obj.moves = 0; 
  };
}

function markTile(){
  console.log("MARKTILE");
  if (obj.state !== "game") { return; };
  if (obj.turn !== player) { return; };
  var $this = $(this);
  if ($this.text() !== '') { return; };
  var str = $this.attr('id'); 
  ref.child('tiles').child(str).set(player); 
  ref.child('moves').transaction(function(oldVal){
    return oldVal + 1; 
  });
  obj.moves++; 
  
  // updateTiles(); 

  // if (obj.state === "game") {
  //   changeTurns(); 
  // };
}






  // ref.child('tiles').on('value', function(snap){


  // })


function clearDom(){
  var str = '#t';
  for (var i = 0; i <= 8; i++) {
    $(str+i).text('');
  };
};

function changeTurns(){
  if (obj.turn === "X") {
    obj.turn = "O";
    $('#display').text("O's turn");
  } else {
    obj.turn = "X";
    $('#display').text("X's turn");
  }
  ref.child('turn').set(obj.turn); 
};

var win = function(xo) {
  var $t0 = $('#t0').text(); 
  var $t1 = $('#t1').text(); 
  var $t2 = $('#t2').text(); 
  var $t3 = $('#t3').text(); 
  var $t4 = $('#t4').text(); 
  var $t5 = $('#t5').text(); 
  var $t6 = $('#t6').text(); 
  var $t7 = $('#t7').text(); 
  var $t8 = $('#t8').text(); 
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
  return (t===xo && t1===xo && t2===xo);
};


function reset(){
  if (obj.state !== "gameOver") { return };
  ref.child('postGame').set("X's turn"); 
  ref.child('tiles').set({
    t0: '', t1: '', t2: '', 
    t3: '', t4: '', t5: '', 
    t6: '', t7: '', t8: ''
  });
  ref.child('state').set('game');
  obj.state = 'game';
  ref.child('turn').set('X');
  obj.turn = "X"; 
  $('#display').text("X's turn")
  ref.child('moves').set(0); 
  obj.moves = 0; 
  updateTiles();  
}