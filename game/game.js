Reflexerado.Game = function (game) {

    this.startNewRound;

    this.buttons;

    this.inputs;

    this.lifes;
    this.maxlifes;
    this.hearts;

    this.stoppageTime;

    this.enabledButtonIndex;

    this.gameScore;

    this.minRoundTime;
    this.maxRoundTime;

    this.views;

    this.round;

    this.playerOneLocked;
    this.playerTwoLocked;

    this.sound;
    this.tumbleweed;
    this.interAnimation;

    this.isFinished;
};

var keycounter = 0;
Reflexerado.Game.prototype = {

    init: function (data) {
        this.input.enabled = false;
        this.controls = data.controls;
        this.startNewRound = false;
        this.buttons = {p1: [], p2: []};
        this.inputs = {p1: [], p2: []};
        this.lifes = {p1: [], p2: []};
        this.maxlifes = 5;
        this.gameScore = "";
        this.minRoundTime = 2;
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

        this.hearts = {
            p1: null,
            p2: null
        };

        this.sound = {
            shoot: null,
            pain: null
        };
        //overriding sound attribute
        this.sound = data.mute;
        this.tumbleweed = {
            minTime: 25,
            maxTime: 50,
            isPlanned: false
        };
        this.interAnimation = {
            minTime: 5,
            maxTime: 20,
            values: ["turn", "scratch", "hat"]
        };

        this.isFinished = false;
    },

    create: function () {

        if (debug === true) {
            this.maxlifes = 2;

            this.minRoundTime = 2;
            this.maxRoundTime = 3;

            this.tumbleweed.minTime = 1;
            this.tumbleweed.maxTime = 5;

            this.interAnimation.minTime = 5;
            this.interAnimation.maxTime = 5;
        }

        //be aware. anything here is called on state reload!
        var bg = this.add.image(0, 0, 'bg');
        this.sound.shoot = this.add.audio('shot');
        this.sound.pain = this.add.audio('pain');
        this.sound.pain.volume = 0.3;

        if (webmode === true) {
            this.muteKey = this.input.keyboard.addKey(Phaser.Keyboard.Z);
            this.muteKey.onDown.add(function () {
                this.sound.mute = !this.sound.mute;
            }, this);
        }

        //p1 unten - rot
        //p2 oben - gelb
        this.initButtons();

        this.initPlayerView();
        this.initGameObjects();

        // start game logic
        this.startNewRound = true;
    },

    update: function () {
        if (this.isFinished === false) {
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

            this.planTumbleweed();

            if (this.startNewRound === true) {
                this.startNewRound = false;
                this.startRound();
            }
        }
    },

    render: function () {
        if (debug === true) {
            if (this.gameScore) {
                this.gameScore.destroy();
            }
            //this.gameScore = this.add.text(550, 500, 'lifes: ' + this.lifes.p1.length + ' : ' + this.lifes.p2.length, {font: "36pt Western"});
        }
    },

    startRound: function () {

        this.views.p1.animations.play('idle');
        this.views.p2.animations.play('idle');

        this.initIntermediateAnimations();

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

    initIntermediateAnimations: function () {
        // turn head every x seconds
        if (debug === true)
            console.log("init inter animation.");

        this.time.events.add(Phaser.Timer.SECOND *
            this.rnd.realInRange(this.interAnimation.minTime, this.interAnimation.maxTime), function () {
            if (this.isFinished === false) {
                var player = "p" + Math.round(this.rnd.realInRange(1, 2));
                var anim = Math.round(this.rnd.realInRange(0, 2));
                if (debug === true) {
                    player = "p1";
                    console.log("playing anim " + player + " : " + this.interAnimation.values[anim]);
                }
                this.views[player].animations.play(this.interAnimation.values[anim]).onComplete.addOnce(function () {
                    if (this.isFinished === false) {
                        this.views[player].animations.play('idle');
                    }
                }, this);
            }
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

        //reset button press
        this.inputs[player][keyIndex].isDown = false;

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

        if (debug === true)
            console.log('starting calc round');

        this.createScoreAnimations(this.round[winner].time, this.round[loser].time, winner, loser);

        this.views[winner].animations.stop();
        this.views[loser].animations.stop();


        //play winner animation and reduce life of loser
        this.time.events.add(Phaser.Timer.SECOND, function () {
            if (debug === true)
                console.log('play shoot');
            this.views[winner].animations.play('shoot');

            //tween bullet animation.
            this.shootBullet(winner, loser);

            this.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
                this.views[loser].animations.play('hit').onComplete.addOnce(function () {
                    //this.views[loser].animations.stop();
                    if (this.lifes[loser].length > 1) {
                        this.loseLife(this.lifes[loser][0], loser);
                        this.startNewRound = true;
                    } else {
                        this.loseLife(this.lifes[loser][0], loser);
                        this.views[loser].animations.play('death').onComplete.add(function () {
                            this.finishGame(loser);
                        }, this);
                    }
                }, this);
            }, this);
        }, this);

    },

    shootBullet: function (winner, loser) {
        var pos = this.views[winner].position;
        var posEnd = this.views[loser].position;

        this.bullet.position.x = pos.x + this.views[winner].width / 2;
        this.bullet.position.y = pos.y + this.views[winner].height / 3; // workaround for correct bullet starting point.
        this.sound.shoot.play();
        this.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
            this.time.events.add(Phaser.Timer.SECOND * 0.2, function () {
                this.bullet.visible = true;
            }, this);
            this.add.tween(this.bullet).to(
                {
                    x: posEnd.x + this.views.p1.width / 2,
                    y: posEnd.y
                }, 200, Phaser.Easing.Default, true).onComplete.add(function () {
                this.bullet.visible = false;
                this.sound.pain.play();
            }, this);
        }, this);
    },

    loseLife: function (heart, loser) {

        if (debug === true)
            console.log('losing heart ' + heart.position.x);
        var posx = heart.position.x;
        //var posy = heart.position.y;
        heart.destroy();
        this.lifes[loser].shift();

        this.hearts[loser].position.x = posx;
        //this.hearts[loser].position.y = pos.y;
        this.hearts[loser].visible = true;

        this.hearts[loser].animations.play('kill').onComplete.add(function () {
            this.hearts[loser].visible = false;
        }, this);

    },


    planTumbleweed: function () {
        if (this.tumbleweed.isPlanned === false) {
            //get random time 25-50s
            this.time.events.add(Phaser.Timer.SECOND *
                this.rnd.realInRange(this.tumbleweed.minTime, this.tumbleweed.maxTime), function () {
                this.runTumbleweed();
            }, this);

            this.tumbleweed.isPlanned = true;
        }
    },
    runTumbleweed: function () {
        //get random x, y
        var found = false;
        var startX = 0;
        var startY = -40;
        var endY = this.world.height - 10;
        while (!found) {
            startX = this.rnd.realInRange(this.world.width / 3, this.world.width * (2 / 3));
            if (!(startX > this.views.p1.position.x && startX < (this.views.p1.position.x + this.views.p1.width))) {
                found = true;
            } else {
                if (debug === true)
                    console.log("no valid tumbleweed position.");
            }
        }

        var compl = Math.round(startX);
        if (compl % 2 === 0) {
            if (debug === true)
                console.log("tumbleweed inverse run.");
            var temp = startY;
            startY = endY;
            endY = temp;
        }

        var tumbleweed = this.add.sprite(startX, startY, 'tumbleweed');
        tumbleweed.animations.add('run', Phaser.ArrayUtils.numberArray(0, 3), 8, true);

        tumbleweed.play('run');

        this.add.tween(tumbleweed).to(
            {
                x: startX,
                y: endY
            }, 4000, Phaser.Easing.Default, true).onComplete.add(function () {
            tumbleweed.destroy();
        }, this);

        this.tumbleweed.isPlanned = false;


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
        } else if (timeW === Number.MAX_VALUE && timeL === Number.MAX_VALUE) {
            this.createAnimation(timeW, "p1", false);
            this.createAnimation(timeL, "p2", false);
        } else {
            this.createAnimation("equal!", "none", false);
        }

    },


    createAnimation: function (message, player, tweenEnabled) {

        var offset = 0;
        if (player === "p1") {
            offset = 120;
        } else if (player === "p2") {
            offset = -150;
        }

        if (message === Number.MAX_VALUE) {
            message = "miss!";
        }

        //Create a new label for the score
        var scoreAnimation = this.add.text(this.world.centerX - offset, this.world.centerY + offset, message, {
            font: "45pt Western",
            fill: "brown",
            stroke: "#ffffff",
            strokeThickness: 15
        });

        if (player === "p2") {
            scoreAnimation.scale.x *= -1;
            scoreAnimation.scale.y *= -1;
        }

        scoreAnimation.anchor.setTo(0.5, 0);
        scoreAnimation.align = 'center';

        if (tweenEnabled === true) {
            this.add.tween(scoreAnimation.scale).to(
                {
                    x: 2 * ((player === "p2") ? -1 : 1),
                    y: 2 * ((player === "p2") ? -1 : 1)
                }, 1200, Phaser.Easing.Exponential.In, true).onComplete.add(function () {
                scoreAnimation.destroy();
            }, this);
        } else {
            this.time.events.add(Phaser.Timer.SECOND * 1.2, function () {
                scoreAnimation.destroy();
            }, this);
        }
    },

    flipAnimation: function (scoreAnimation) {
        if (debug == true)
            console.log("flipping score animation");
        scoreAnimation.scale.y *= -1;
        scoreAnimation.scale.x *= -1;
    },

    finishGame: function (loser) {
        this.isFinished = true;
        this.resetRoundParameters();
        this.views.p1.animations.is
        //this.views.p1.animations.stop();
        //this.views.p2.animations.stop();
        if (this.debug === true)
            this.gameScore.destroy();
        var textp2;
        var winnerText = "Lucky Luke is proud of you.";
        var loserText = "next match starts at noon...";
        if (loser === "p1") {
            textp2 = this.add.text(this.world.centerX + 240, this.world.centerY - 25, winnerText, {
                font: "36pt Western",
                fill: "black"
            });
            this.add.text(this.world.centerX - 240, this.world.centerY + 25, loserText, {
                font: "36pt Western",
                fill: "black"
            });
        } else {
            this.add.text(this.world.centerX - 240, this.world.centerY + 25, winnerText, {
                font: "36pt Western",
                fill: "black"
            });
            textp2 = this.add.text(this.world.centerX + 240, this.world.centerY - 25, loserText, {
                font: "36pt Western",
                fill: "black"
            });
        }
        textp2.scale.x *= -1;
        textp2.scale.y *= -1;

        this.time.events.add(Phaser.Timer.SECOND * 4, function () {
            this.state.start("MainMenu", true);
        }, this);

    },


    //init functions
    initButtons: function () {
        //controls
        this.buttons.p1.push(this.add.sprite(this.world.centerX - 96, this.world.height - 146, 'btns-blue'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX, this.world.height - 274, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX + 96, this.world.height - 146, 'btns-blue'));

        this.buttons.p2.push(this.add.sprite(this.world.centerX - 96, 82, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX, 210, 'btns-red'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX + 96, 82, 'btns-blue'));

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
    },

    initPlayerView: function () {
        //player animations

        this.views.p1 = this.add.sprite(this.world.centerX - 96, this.world.height - 274, 'p1_animations');
        this.views.p1.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 13), 4, true);
        this.views.p1.animations.add('turn', Phaser.ArrayUtils.numberArray(14, 18), 4, false);
        this.views.p1.animations.add('scratch', Phaser.ArrayUtils.numberArray(19, 22), 4, false);
        this.views.p1.animations.add('hat', Phaser.ArrayUtils.numberArray(23, 30), 4, false);
        this.views.p1.animations.add('shoot', Phaser.ArrayUtils.numberArray(31, 44), 10, false);
        this.views.p1.animations.add('hit', Phaser.ArrayUtils.numberArray(45, 49), 10, false);
        this.views.p1.animations.add('death', Phaser.ArrayUtils.numberArray(50, 59), 5, false);

        if (debug === true)
            this.add.text(this.world.centerX - 96, this.world.height - 274, 'p1');

        this.views.p2 = this.add.sprite(this.world.centerX - 96, 96, 'p2_animations');
        this.views.p2.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 13), 4, true);
        this.views.p2.animations.add('turn', Phaser.ArrayUtils.numberArray(14, 18), 4, false);
        this.views.p2.animations.add('scratch', Phaser.ArrayUtils.numberArray(19, 22), 4, false);
        this.views.p2.animations.add('hat', Phaser.ArrayUtils.numberArray(23, 30), 4, false);
        this.views.p2.animations.add('shoot', Phaser.ArrayUtils.numberArray(31, 44), 10, false);
        this.views.p2.animations.add('hit', Phaser.ArrayUtils.numberArray(45, 49), 10, false);
        this.views.p2.animations.add('death', Phaser.ArrayUtils.numberArray(50, 59), 5, false);


        if (debug === true)
            this.add.text(this.world.centerX + 96, 274, 'p2');
    },

    initGameObjects: function () {
        //bullet
        this.bullet = this.add.image(0, 0, 'bullet');
        this.bullet.scale.setTo(0.5, 0.65);
        this.bullet.anchor.setTo(0.5, 0.5);
        this.bullet.visible = false;


        //init hearts
        for (var i = 0; i < this.maxlifes; i++) {
            this.lifes.p1.push(this.add.sprite(this.world.width / 2 - 60 + 40 * i, this.world.height - 60, 'heart'));
            this.lifes.p2.push(this.add.sprite(this.world.width / 2 + 92 - 40 * i, 64, 'heart'));
            this.lifes.p2[i].scale.y *= -1;
        }

        //heart animation
        this.hearts.p1 = this.add.sprite(this.world.width / 2 - 60, this.world.height - 60, 'heart_animation');
        this.hearts.p1.animations.add('kill', Phaser.ArrayUtils.numberArray(0, 3), 5, false);
        this.hearts.p1.visible = false;

        //heart animation
        this.hearts.p2 = this.add.sprite(this.world.width / 2 + 92, 64, 'heart_flipped_animation');
        this.hearts.p2.animations.add('kill', Phaser.ArrayUtils.numberArray(0, 3), 5, false);
        this.hearts.p2.visible = false;
        this.hearts.p2.anchor.set(0, 1);
    }
};
