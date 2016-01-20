'use strict'; 
$(document).ready(init); 

var ref = new Firebase('https://tictactoe2016.firebaseio.com/');
var playersRef = ref.child('players')
// var gameRef = ref.child('game');
var tilesRef = ref.child('tiles'); 
var movesRef = ref.child('moves'); // same as state? no. moves is a number. state is a string. 
var stateRef = ref.child('state'); // no moves. lobby, countdown, game, gameover 
var player; //if someone's in, you're p2. else, you're p1. 
// var turn; 
// var turnRef = ref.child('turn'); 
var myTurn; // true if it's your turn. 
var turn; 
var state;
var obj = {};  


function init() { 
  ref.child('state').on('value', function(snap) {    
    console.log(snap.val());
    if (!snap.val()) {
      ref.child('state').set('lobby');
      state = 'lobby';
      console.log("success?");
    } else {
      state = snap.val(); 
    }
  }); 

  ref.child('turn').on('value', function(snap){
    if (snap.val()) {turn = snap.val()};
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

  $('#play').click(startGame); 
  $('#game').on('click', '.tile',(markTile)); 
};


function markTile(){
  console.log("MARKTILE");
  if (state !== "game") { return; };
  if (turn !== player) {
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
  if (turn === "p1") {
    turn = "p2";
  } else {
    turn = "p1";
  }
  ref.child('turn').set(turn); 
  updateTiles(); 
  if (obj.moves >= 5) { 
    console.log(win(turn), "true or false?");
    if(!win(turn) && obj.moves === 9){
      alert("tie!"); 
    } else if( win(turn) ){
      alert(turn + "wins!");
    }
       
  };
}



function enterName() {
  console.log($('#name').val());
  
  playersRef.once('value', function(snapshot){
    console.log(snapshot.val());
    if (!snapshot.val()) {
      playersRef.push($('#name').val() );
      player = 'p1'; // this is how you know which player you are.
    } else if( Object.keys(snapshot.val()).length === 1){
      playersRef.push($('#name').val() );
      player = 'p2';
    } else {
      return; 
    }
  });
}


function startGame(){
  // make turn child in firebase and initialize it to p1; 
  // ref.child('state').set('countDown');
  console.log("startGame");
  console.log("state: ", state);
  if (state === "lobby") {
    ref.child('state').set('game');
    ref.child('turn').set('p1');
    $('#display').text("p1")
    turn = "p1"; 
    ref.child('moves').set(0); 
  };

}



function updateTiles(){
  ref.child('tiles').on('value', function(snap){
    var board = snap.val(); 
    clearDom(); 

    $('#display').text(turn + "'s turn"); 
    $('#t0').text(board.t0); $('#t1').text(board.t1); $('#t2').text(board.t2);
    $('#t3').text(board.t3); $('#t4').text(board.t4); $('#t5').text(board.t5);
    $('#t6').text(board.t6); $('#t7').text(board.t7); $('#t8').text(board.t8);
    // $('#timer').text()
  })
}

function clearDom(){
  var str = '#t';
  for (var i = 0; i <= 8; i++) {
    $(str+i).text('');
  };
};

function checkWin(tile, mark){

}

function win( xo ){
  console.log("win?");
  ref.child('tiles').once('value', function(snap){
    console.log('tiles snap val: ', snap.val());
    console.log('tiles snap val tile: ', snap.val().t0);
    var t0 = snap.val().t0; var t1 = snap.val().t1; var t2 = snap.val().t2; 
    var t3 = snap.val().t3; var t4 = snap.val().t4; var t5 = snap.val().t5; 
    var t6 = snap.val().t6; var t7 = snap.val().t7; var t8 = snap.val().t8;     
  if(
    check(t0, t1, t2, xo) || 
    check(t3, t4, t5, xo) || 
    check(t6, t7, t8, xo) || 
    check(t0, t3, t6, xo) || 
    check(t1, t4, t7, xo) || 
    check(t2, t5, t8, xo) || 
    check(t0, t4, t8, xo) || 
    check(t2, t4, t6, xo) 
    ) { console.log("true "); return true;  } else {console.log("false"); return false;};
  })

  // var $t0 = $('#t0'); var $t1 = $('#t1'); var $t2 = $('#t2'); 
  // var $t3 = $('#t3'); var $t4 = $('#t4'); var $t5 = $('#t5'); 
  // var $t6 = $('#t6'); var $t7 = $('#t7'); var $t8 = $('#t8'); 
  // return(
  //   check($t0, $t1, $t2, xo) || 
  //   check($t3, $t4, $t5, xo) || 
  //   check($t6, $t7, $t8, xo) || 
  //   check($t0, $t3, $t6, xo) || 
  //   check($t1, $t4, $t7, xo) || 
  //   check($t2, $t5, $t8, xo) || 
  //   check($t0, $t4, $t8, xo) || 
  //   check($t2, $t4, $t6, xo) 
  //   );


}; 

// var check = function(t, t1, t2, xo){
//   return (t.text()===xo && t1.text()===xo && t2.text()===xo);
// };
var check = function(t, t1, t2, xo){
  console.log("check?");
  if ( (t===xo && t1===xo )&& t2===xo ){
    return true; 
  } else {
    return false; 
  }
};



// function tileClick(event){
//   console.log(state);
//   if (state === 'game') {
//     var $this = $(this);
//     if (state!=='gameover' && $this.text() === '') {
//       var mark = '';
//       if (turn === "p1") {
//         mark = 'X';
//         turn = "p2";
//         console.log(name);
//         $display.text(name + "'s turn");        
//       } else {
//         mark = 'O';
//         turn = 'p1'; 
//         console.log(name2);
//         $display.text(name2 + "'s turn");
//       }
//       $this.text(mark);     
      


//       if (win(mark)) {
//         $reset.text("Play again");
//         state = 'gameover';      
//         var winner;
//         if (xo) { winner = name;} else {winner = name2;};
//         var message = winner + " " + mark + " wins!"
//         $display.text(message); 
//         window.clearTimeout(myTimer);
//         $('#game').off();
//       };
//     };
    
//   };
// };

// function playClick(event){
//   name = $name.val();
//   name2 = $name2.val();
//   $play.text('');
//   state = "game";
  // secx = 60; 
  // seco = 60; 
  // myTimer = window.setInterval(function(){
  //   if (state === 'game') {
  //     if (turn === "p1") {
  //       if (sec1 > 0) {
  //         sec1--;     
  //         $timer.text(sec1);        
  //       } else {
  //         $display.text("Time is up! "+name2+" \u2665 loses!")
  //         window.clearTimeout(myTimer);
  //         $('#game').off();
  //         $reset.text("Play again");
  //       }
        
  //     } else {
  //       if (secx > 0) {
  //         secx--;     
  //         $timer2.text(secx);              
  //       } else {
  //         $display.text("Time is up! "+name+" \u2660 loses!")
  //         window.clearTimeout(myTimer);
  //         $('#game').off();
  //         $reset.text("Play again");
  //       }
  //     }
      
  //   };

  // }, 200);
  // xo = false; 
  // ref.child('turn').set('p1');
  // turn = "p1";
  // state = 'game';
  // ref.child('state').set('game');
  // $display.text(name + "'s turn");
  // $('#play').off(); 

// }

// function countDown(){

// }

// function resetClick(event){
//   window.clearTimeout(myTimer);
//   var clear = ""; 
//   $('#t0').text(clear); 
//   $('#t1').text(clear); 
//   $('#t2').text(clear); 
//   $('#t3').text(clear); 
//   $('#t4').text(clear); 
//   $('#t5').text(clear); 
//   $('#t6').text(clear); 
//   $('#t7').text(clear); 
//   $('#t8').text(clear); 
//   $('#game').on('click', '.tile',(tileClick)); 
//   xo = false; 
//   $display.text('Hit Play');
//   $play.click(playClick).text('Play'); 
//   $timer.text('60');
//   $timer2.text('60');
//   $reset.text('');
//   state = "pregame";
//   name = '';
//   name2 = '';
//   $name.text('');
//   $name2.text('');
// }


// var win = function(xo) {
//   var $t0 = $('#t0'); var $t1 = $('#t1'); var $t2 = $('#t2'); 
//   var $t3 = $('#t3'); var $t4 = $('#t4'); var $t5 = $('#t5'); 
//   var $t6 = $('#t6'); var $t7 = $('#t7'); var $t8 = $('#t8'); 
//   return(
//     check($t0, $t1, $t2, xo) || 
//     check($t3, $t4, $t5, xo) || 
//     check($t6, $t7, $t8, xo) || 
//     check($t0, $t3, $t6, xo) || 
//     check($t1, $t4, $t7, xo) || 
//     check($t2, $t5, $t8, xo) || 
//     check($t0, $t4, $t8, xo) || 
//     check($t2, $t4, $t6, xo) 
//     );
// };

// var check = function(t, t1, t2, xo){
//   return (t.text()===xo && t1.text()===xo && t2.text()===xo);
// };

