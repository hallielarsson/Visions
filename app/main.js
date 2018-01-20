var visions = [];
var characters = [];

var denial = {
  name: "denial",
  scale: 2,
  achieve: 0,
  explore: 0,
  socialize: 0,
  grief: 0,
}

var anger = {
  name: "anger",
  scale: 1,
  achieve: 1,
  explore: -1,
  socialize: -1,
  grief: 1,
}

var bargaining = {
  name: "bargaining",
  scale: 1,
  achieve: 1,
  explore: -1,
  socialize: 1,
  grief: -1,
}

var depression = {
  name: "depression",
  scale: 2,
  achieve: -1,
  explore: 2,
  socialize: -1,
  grief: -1,
}



var defaultStages = [denial, anger, bargaining, depression];

function Vision(name, scale){
  this.name = name;
  this.scale = scale;
  this.progress = 0;
  visions.push(this);
}

function Grief(vision){
  this.vision = vision;
  this.scale = vision.scale;
  this.stages = defaultStages;
  this.stageIndex = 0;
  this.stageDamage = 0;
}

Grief.prototype = {
  TakeDamage: function(amount){
    var totalAmount = amount;
    while(amount > 0){
      var currentDamage = Math.min(this.scale * this.CurrentStage().scale - this.stageDamage, amount);
      this.stageDamage += currentDamage;
      amount -= currentDamage;
      amount = amount < 0? 0 : amount; //not sure we need this, but just in case
      if(this.stageDamage >= this.scale * this.CurrentStage().scale) {
        this.BreakStage();
      }
    }
  },
  CurrentScale: function(){
    return this.scale * this.CurrentStage().scale;
  },
  Reset: function(){
    this.stageDamage = 0;
    this.stageIndex = 0;
  },
  BreakStage: function(){
    if (this.stageIndex + 1< this.stages.length){
      this.stageIndex++;
    }
    this.stageDamage = 0;
  },
  CurrentStage: function(){
    return this.stages[this.stageIndex];
  }
}

function Character(name){
  this.name = name;
  this.griefs = [];
  this.achieve = 0;
  this.explore = 0;
  this.socialize = 0;
  this.grief = 0;

  this.editGrief = {
    name: "",
    description: "",
    scale: 1,
  }

  characters.push(this);
}
Character.prototype = {
  AddVision: function(vision){
    var newGrief = new Grief(vision);
    this.griefs.push(newGrief);
  },
  GetCurrentStats: function(){
    var modStats = {
      "achieve" : this.achieve,
      "explore" : this.explore,
      "socialize" : this.socialize,
      "grief" : this.grief
    }

    for (griefKey in this.griefs){
      var currentGrief = this.griefs[griefKey].CurrentStage();
      console.log(currentGrief);
      modStats.achieve += currentGrief.achieve;
      modStats.explore += currentGrief.explore;
      modStats.socialize += currentGrief.socialize;
      modStats.grief += currentGrief.grief;
    }
    return modStats;
  },
  Roll: function(mod){
    var roll = Math.random() * 6 + Math.random() * 6 + mod;
    roll = Math.ceil(roll);
    alert(roll);


  }
}

var characterOne = new Character("Hal");

$.ajax({url: "./templates/playerView.html", success: function(result){
    var vue = CreateVue("#app", result);
}});

var moves = [];
if(!localStorage.getItem('moves')) {
  $.ajax({
    dataType: "json",
    url: "./data/moves.json",
    complete: function(result){
      var loadedMoves = JSON.parse(result.responseText).basic_moves;
      for (moveKey in loadedMoves){
        moves.push(loadedMoves[moveKey]);
      }
      console.log(moves);

    }
  });
} else {
  moves = JSON.parse(localStorage.getItem('moves'));
}

function CreateVue(elName, template){
  var app = new Vue({
    el: elName,
    template: template,
    data: {
      visions: visions,
      characters: characters,
      moves: moves,
      show_moves: false,
      edit_mode: false,
    },
    methods: {
      AddGriefVision(character){
        var vision = new Vision(character.editGrief.name, character.editGrief.scale);
        //vision.description = character.editGrief.description;
        character.AddVision(vision);
        character.editGrief.name = "";
        character.editGrief.description = "";
        character.editGrief.scale = 1;

      },
      Save(){
        localStorage.setItem('moves', JSON.stringify(this.moves));
      }
    }

  })
  return app;
}