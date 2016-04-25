var debug = false;

Shootme.Game = function (game) {

    this.startNewRound;

    this.buttons;

    this.inputs;

    this.lifes;
    this.maxlifes;
    this.heart;

    this.stoppageTime;

    this.enabledButtonIndex;

    this.gameScore;

    this.minRoundTime;
    this.maxRoundTime;

    this.views;

    this.round;

    this.playerOneLocked;
    this.playerTwoLocked;
};

var keycounter = 0;
Shootme.Game.prototype = {

    init: function (data) {
        this.input.enabled = false;
        this.controls = data.controls;
        this.startNewRound = false;
        this.buttons = {p1: [], p2: []};
        this.inputs = {p1: [], p2: []};
        this.lifes = {p1: [], p2: []};
        this.maxlifes = 5;
        this.gameScore = "";
        this.minRoundTime = 5;
        this.maxRoundTime = 10;
        this.views = {
            p1: null,
            p2: null
        };
        this.round = {
            p1: {
                done: false,
                time: Number.MAX_VALUE
            },
            p2: {
                done: false,
                time: Number.MAX_VALUE
            }
        };
        this.playerOneLocked = false;
        this.playerTwoLocked = false;
    },

    create: function () {

        if (debug === true) {
            this.maxlifes = 2;

            this.minRoundTime = 2;
            this.maxRoundTime = 3;
        }


        //be aware. anything here is called twice!!

        var bg = this.add.image(0, 0, 'bg');

        //player animations
        this.views.p1 = this.add.sprite(this.world.centerX - 96, 16, 'p1_animations');
        this.views.p1.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 8), 10, true);
        this.views.p1.animations.add('shoot', Phaser.ArrayUtils.numberArray(9, 21), 10, false);
        this.views.p1.animations.add('hit', Phaser.ArrayUtils.numberArray(22, 26), 10, false);

        this.views.p2 = this.add.sprite(this.world.centerX - 96, this.world.height - 274, 'p2_animations');
        this.views.p2.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 8), 10, true);
        this.views.p2.animations.add('shoot', Phaser.ArrayUtils.numberArray(9, 21), 10, false);
        this.views.p2.animations.add('hit', Phaser.ArrayUtils.numberArray(22, 26), 10, false);

        //heart animation
        this.heart = this.add.sprite(0, 0, 'heart_animation');
        this.heart.animations.add('kill', Phaser.ArrayUtils.numberArray(0, 3), 5, false);

        //bullet
        this.bullet = this.add.image(0, 0, 'bullet');
        this.bullet.scale.setTo(0.5, 0.65);
        this.bullet.visible = false;

        //controls
        this.buttons.p1.push(this.add.sprite(this.world.centerX - 96, 82, 'btns-blue'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX, 210, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX + 96, 82, 'btns-blue'));

        console.log(this.buttons.p1.length);

        this.buttons.p2.push(this.add.sprite(this.world.centerX - 96, this.world.height - 146, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX, this.world.height - 274, 'btns-red'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX + 96, this.world.height - 146, 'btns-blue'));

        this.inputs.p1 = [this.input.keyboard.addKey(this.controls.p1.left),
            this.input.keyboard.addKey(this.controls.p1.center),
            this.input.keyboard.addKey(this.controls.p1.right)];
        this.inputs.p2 = [this.input.keyboard.addKey(this.controls.p2.left),
            this.input.keyboard.addKey(this.controls.p2.center),
            this.input.keyboard.addKey(this.controls.p2.right)];

        var tempInputs = this.inputs.p1.concat(this.inputs.p2);
        var tempButtons = this.buttons.p1.concat(this.buttons.p2);
        for (var key in tempInputs) {
            tempInputs[key].onDown.add(this.evaluateInput, this);
        }
        for (var nein in tempButtons) {
            tempButtons[nein].scale.setTo(0.5);
            tempButtons[nein].enabled = false;
        }


        //init hearts
        this.lifes.p1 = this.add.group();
        this.lifes.p2 = this.add.group();

        for (var i = 0; i < this.maxlifes; i++) {
            this.lifes.p1.create(this.world.width / 2 - 60 + 40 * i, 30, 'heart');
            this.lifes.p2.create(this.world.width / 2 - 60 + 40 * i, this.world.height - 60, 'heart');
        }

        // start game logic
        this.startNewRound = true;

    },

    update: function () {
        if (this.round.p1.done === true && this.round.p2.done === true) {
            if (debug === true)
                console.log("got result");
            this.input.enabled = false;
            if (this.round.p1.time < this.round.p2.time) {
                this.calcRound("p1", "p2");
            } else if (this.round.p1.time > this.round.p2.time) {
                this.calcRound("p2", "p1");
            } else {
                //show two misses.
                this.createScoreAnimations(this.round.p1.time, this.round.p2.time, "none", "none");
                this.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
                    this.startNewRound = true;
                }, this);
            }

            //reset round parameters
            this.resetRoundParameters();
        }

        if (this.startNewRound === true) {
            this.startNewRound = false;
            this.startRound();
        }
    },

    render: function () {
        if (debug === true) {
            if (this.gameScore) {
                this.gameScore.destroy();
            }
            this.gameScore = this.add.text(550, 500, 'lifes: ' + this.lifes.p1.length + ' : ' + this.lifes.p2.length, {font: '36pt Arial'});
        }
    },

    startRound: function () {

        this.views.p1.animations.play('idle');
        this.views.p2.animations.play('idle');

        this.time.events.add(Phaser.Timer.SECOND *
            this.rnd.realInRange(this.minRoundTime, this.maxRoundTime), function () {
            this.enabledButtonIndex = this.rnd.integerInRange(0, 2);
            if (debug === true) {
                this.enabledButtonIndex = 1;
                console.log("enable button " + this.enabledButtonIndex);
            }
            this.showAndEnableButtons();
            this.stoppageTime = this.time.now;
            this.input.enabled = true;
        }, this);
    },


    showAndEnableButtons: function () {
        this.buttons.p1[this.enabledButtonIndex].frame = 1;
        this.buttons.p2[this.enabledButtonIndex].frame = 1;

        this.buttons.p1[this.enabledButtonIndex].enabled = true;
        this.buttons.p2[this.enabledButtonIndex].enabled = true;
    },


    //is called after every keypress of a player

    evaluateInput: function (keyObj) {
        if (debug === true)
            console.log("evaluationg keys " + keycounter++);
        var p1_key = this.inputs.p1.indexOf(keyObj);
        var p2_key = this.inputs.p2.indexOf(keyObj);

        if (p1_key > -1 && !this.playerOneLocked) {
            if (debug === true)
                console.log("p1 not locked and in");
            this.playerOneLocked = true;
            this.evaluateKeyPress(p1_key, "p1");

        } else if (p2_key > -1 && !this.playerTwoLocked) {
            if (debug === true)
                console.log("p2 not locked and in");
            this.playerTwoLocked = true;
            this.evaluateKeyPress(p2_key, "p2");
        }

    },

    evaluateKeyPress: function (keyIndex, player) {
        this.round[player].done = true;
        this.round[player].time =
            (keyIndex === this.enabledButtonIndex ? this.time.now - this.stoppageTime : Number.MAX_VALUE);

        //reset enabled button
        this.buttons[player][this.enabledButtonIndex].frame = 0;

        //show button pressed view.
        this.buttons[player][keyIndex].frame = 2;

        //set timer to reset button view.
        this.time.events.add(Phaser.Timer.SECOND / 4, function () {
            this.buttons[player][keyIndex].frame = 0;
        }, this);
    },

    calcRound: function (winner, loser) {

        this.createScoreAnimations(this.round[winner].time, this.round[loser].time, winner, loser);

        this.views[winner].animations.stop();
        this.views[loser].animations.stop();


        //play winner animation and reduce life of loser
        this.time.events.add(Phaser.Timer.SECOND, function () {
            this.views[winner].animations.play('shoot');
            //tween bullet.
            this.shootBullet(winner, loser);

            this.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
                this.views[loser].animations.play('hit').onComplete.add(function () {
                    //this.views[loser].animations.stop();
                    if (this.lifes[loser].children.length > 1) {
                        this.loseLife(this.lifes[loser].getAt(0));
                        this.startNewRound = true;
                    } else {
                        this.loseLife(this.lifes[loser]);
                        this.finishGame();
                    }
                }, this);
            }, this);
        }, this);

    },

    shootBullet: function (winner, loser) {

        var pos = this.views[winner].position;
        var posEnd = this.views[loser].position;

        this.bullet.position.x = pos.x + this.views[winner].width / 2;
        this.bullet.position.y = pos.y - 10;
        this.bullet.visible = true;
        this.add.tween(this.bullet).to(
            {
                x: posEnd.x + this.views.p1.width / 2,
                y: posEnd.y
            }, 200, Phaser.Easing.Default, true).onComplete.add(function () {
            this.bullet.visible = false;
        }, this);
    },

    loseLife: function (heart) {
        var pos = heart.position;
        heart.destroy();

        this.heart.position.x = pos.x;
        this.heart.position.y = pos.y;
        this.heart.animations.play('kill');
    },

    resetRoundParameters: function () {
        this.playerOneLocked = false;
        this.playerTwoLocked = false;

        this.buttons.p1[this.enabledButtonIndex].frame = 0;
        this.buttons.p2[this.enabledButtonIndex].frame = 0;

        this.round.p1.done = false;
        this.round.p2.done = false;

        this.round.p1.time = Number.MAX_VALUE;
        this.round.p2.time = Number.MAX_VALUE;

    },

    createScoreAnimations: function (timeW, timeL, winner, loser) {

        if (winner === "p1" && loser === "p2") {
            this.createAnimation(timeW, "p1", true);
            this.createAnimation(timeL, "p2", false);
        } else if (winner === "p2" && loser === "p1") {
            this.createAnimation(timeW, "p2", true);
            this.createAnimation(timeL, "p1", false);
        } else {
            this.createAnimation("equal!", "none", false);
        }

    },


    createAnimation: function (message, player, tweenEnabled) {

        var offset = 0;
        if (player === "p1") {
            offset = -150;
        } else if (player === "p2") {
            offset = 150;
        }

        if (message === Number.MAX_VALUE) {
            message = "miss!";
        }

        var scoreFont = "45px Arial";
        //Create a new label for the score
        var scoreAnimation = this.add.text(this.world.centerX - offset, this.world.centerY + offset, message, {
            font: scoreFont,
            fill: "#39d179",
            stroke: "#ffffff",
            strokeThickness: 15
        });
        scoreAnimation.anchor.setTo(0.5, 0);
        scoreAnimation.align = 'center';

        if (tweenEnabled) {
            this.add.tween(scoreAnimation).to(
                {
                    x: this.world.centerX - offset,
                    y: this.world.centerY + offset
                }, 800, Phaser.Easing.Exponential.In, true).onComplete.add(function () {
                scoreAnimation.destroy();
            }, this);
        } else {
            this.time.events.add(Phaser.Timer.SECOND, function () {
                scoreAnimation.destroy();
            }, this);
        }
    },

    finishGame: function () {
        this.resetRoundParameters();
        this.views.p1.animations.stop();
        this.views.p2.animations.stop();
        this.gameScore.destroy();
        this.add.text(550, 600, "end, press any key to exit");

        this.time.events.add(Phaser.Timer.SECOND * 3, function () {
            this.state.start("MainMenu", true);
        }, this);

    }
};
