$(document).ready(function() {

  function Player() {
    let hand=[], wager=0, cash=10000;
    this.getHand = () => hand;
    this.setHand = card => hand.push(card);
    this.resetHand = () => hand=[];

    this.getWager = () => wager;
    this.setWager = amount => wager = amount;
    this.resetWager = () => wager=0;
    this.checkWager = () => wager <= cash;

    this.getCash = () => cash;
    this.setCash = amount => { cash+=amount; updateBoard(); };

    this.getScore = function() {
      let score=0, aces=0;
      hand.forEach(c=>{score+=c.value; if(c.rank==='A') aces++;});
      while(score>21 && aces>0){score-=10; aces--;}
      return score;
    }

    this.getElement = function(){return (this===player)?'#phand':'#dhand';}
  }

  function Card(rank,suit){
    this.rank=rank;
    this.suit=suit;
    this.value = (rank==='A')?11:(['K','Q','J'].includes(rank)?10:parseInt(rank));
  }

  function Deck(){
    const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const suits=['♠','♣','♥','♦'];
    this.cards=[];
    ranks.forEach(r=>suits.forEach(s=>this.cards.push(new Card(r,s))));
  }

  Deck.prototype.shuffle=function(){
    let m=this.cards.length,t,i;
    while(m){ i=Math.floor(Math.random()*m--); t=this.cards[m]; this.cards[m]=this.cards[i]; this.cards[i]=t;}
    return this.cards;
  }

  let player=new Player(), dealer=new Player(), deck, running=false;

  function updateBoard(){
    $('#cash span').text(player.getCash());
    $('#wager-display span').text(player.getWager()||0);
  }

  function renderCard(ele,card,down=false){
    let cardHtml=`<div class='card${down?' down':''}'>
      <span class='rank'>${card.rank}</span>
      <span class='suit ${['♥','♦'].includes(card.suit)?'red':''}'>${card.suit}</span>
    </div>`;
    $(ele).append(cardHtml).children().last().hide().fadeIn(400);
  }

  function dealCard(sender,down=false){
    let card=deck.cards.pop();
    sender.setHand(card);
    renderCard(sender.getElement(),card,down);
  }

  function resetBoard(){ $('#phand,#dhand').html(''); }

  function showAlert(msg){
    $('#alert span').html(`<strong>${msg}</strong>`);
    $('#alert').fadeIn(200).delay(1200).fadeOut(400);
  }

  function checkWinner(){
    let pScore=player.getScore(), dScore=dealer.getScore();
    $('#dhand .down').removeClass('down');
    if(pScore>21){ showAlert("Você perdeu!"); }
    else if(dScore>21 || pScore>dScore){ showAlert("Você venceu!"); player.setCash(player.getWager()*2); }
    else if(pScore===dScore){ showAlert("Empate!"); player.setCash(player.getWager()); }
    else{ showAlert("Você perdeu!"); }

    player.resetWager();
    running=false;
    $('#hit,#stand').prop('disabled',true);
    $('#deal').prop('disabled',false);
    $('#wager').prop('disabled',false);
    updateBoard();
  }

  function startGame(){
    let wager=parseInt($('#wager').val());
    if(isNaN(wager)||wager<=0){ showAlert("Digite uma aposta válida!"); return; }
    player.setWager(wager);
    if(!player.checkWager()){ showAlert("Aposta maior que saldo!"); return; }

    running=true;
    resetBoard();
    deck=new Deck(); deck.shuffle();
    player.resetHand(); dealer.resetHand();

    player.setCash(-wager);
    $('#wager').prop('disabled',true);

    dealCard(player);
    dealCard(dealer,true);
    dealCard(player);
    dealCard(dealer);

    updateBoard();
    $('#hit,#stand').prop('disabled',false);
    $('#deal').prop('disabled',true);
  }

  function hit(){ if(!running) return; dealCard(player); if(player.getScore()>21) checkWinner(); }
  function stand(){ if(!running) return; while(dealer.getScore()<17) dealCard(dealer); checkWinner(); }

  $('#deal').click(startGame);
  $('#hit').click(hit);
  $('#stand').click(stand);

  updateBoard();
});
