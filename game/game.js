define(["require", "exports"], function (require, exports) {

    var floor;
    var buttons = {p1: [], p2: []};

    var inputs = {p1: null, p2: null};

    var points = {p1: 0, p2: 0};

    var time;

    var enabledButton = -1;

    var game = new Phaser.Game(500, 400, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    function preload() {
        game.load.spritesheet('floor_asset', 'assets/floor_grass.jpg');
        game.load.spritesheet('button_asset', 'assets/button.png', 128, 128);
        game.load.spritesheet('button-red_asset', 'assets/button-red.png', 128, 128);
    }

    function create() {
        floor = game.add.sprite(0, 0, 'floor_asset');
        console.log(buttons);
        buttons.p1.push(game.add.sprite(0, 0, 'button_asset'));
        buttons.p1.push(game.add.sprite(96, 64, 'button-red_asset'));
        buttons.p1.push(game.add.sprite(0, 128, 'button_asset'));


        buttons.p2.push(game.add.sprite(384, 0, 'button_asset'));
        buttons.p2.push(game.add.sprite(256, 64, 'button-red_asset'));
        buttons.p2.push(game.add.sprite(384, 128, 'button_asset'));

        game.input.enabled = false;
        inputs.p1 = [game.input.keyboard.addKey(Phaser.Keyboard.Q),
            game.input.keyboard.addKey(Phaser.Keyboard.S),
            game.input.keyboard.addKey(Phaser.Keyboard.Y)];
        inputs.p2 = [game.input.keyboard.addKey(Phaser.Keyboard.I),
            game.input.keyboard.addKey(Phaser.Keyboard.J),
            game.input.keyboard.addKey(Phaser.Keyboard.M)];

        var tempInputs = inputs.p1.concat(inputs.p2);
        var tempButtons = buttons.p1.concat(buttons.p2);
        for (var key in tempInputs) {
            tempInputs[key].onDown.add(function (key) {

                console.log(keyIndex++);
                evaluateInput(key);
            });
        }
        for (var nein in tempButtons) {
            tempButtons[nein].enabled = false;
        }

        enableRandomButton();

    }

    function enableRandomButton() {
        game.time.events.add(Phaser.Timer.SECOND *
            game.rnd.realInRange(1, 2), activateChallenge, this);
    }

    function activateChallenge() {
        enabledButton = game.rnd.integerInRange(0, 2);
        console.log("enable button " + enabledButton);
        showAndEnableButtons(enabledButton);
        time = game.time.now
    }

    function showAndEnableButtons(enabledButton) {
        buttons.p1[enabledButton].frame = 1;
        buttons.p2[enabledButton].frame = 1;

        buttons.p1[enabledButton].enabled = true;
        buttons.p2[enabledButton].enabled = true;
        game.input.enabled = true;
    }

    var keyIndex = 0;
    var timeP1 = null;
    var timeP2 = null;

    function evaluateInput(keyObj) {

        if (inputs.p1.indexOf(keyObj) !== -1) {
            if (inputs.p1.indexOf(keyObj) === enabledButton) {
                timeP1 = game.time.now - time;

            } else {
                timeP1 = "wrong";
            }
            buttons.p1[enabledButton].frame = 0;
        } else if (inputs.p2.indexOf(keyObj) !== -1) {
            if (inputs.p2.indexOf(keyObj) === enabledButton) {
                timeP2 = game.time.now - time;

            } else {
                timeP2 = "wrong";
            }
            buttons.p2[enabledButton].frame = 0;
        }
        keyObj.isDown = false;
        console.log(timeP1 + " - " + timeP2);
        if (timeP1 && timeP2) {
            if (Number.isInteger(timeP1) && isNaN(timeP2) || timeP1 < timeP2) {
                points.p1++;
            } else if (Number.isInteger(timeP2) && isNaN(timeP1) || timeP2 < timeP1) {
                points.p2++;
            }

            createScoreAnimation(game.world.centerX - 150, timeP1);
            createScoreAnimation(game.world.centerX + 150, timeP2);
            timeP1 = 0;
            timeP2 = 0;

            game.input.enabled = false;
            enableRandomButton();
        }
    }

    function createScoreAnimation(x, message) {

        var scoreFont = "45px Arial";

        //Create a new label for the score
        var scoreAnimation = game.add.text(x, game.world.centerY, message, {
            font: scoreFont,
            fill: "#39d179",
            stroke: "#ffffff",
            strokeThickness: 15
        });
        scoreAnimation.anchor.setTo(0.5, 0);
        scoreAnimation.align = 'center';

        //Tween this score label to the total score label
        var scoreTween = game.add.tween(scoreAnimation).to({x: x, y: 400}, 800, Phaser.Easing.Exponential.In, true);

        //When the animation finishes, destroy this score label, trigger the total score labels animation and add the score
        scoreTween.onComplete.add(function () {
            scoreAnimation.destroy();
        }, game);
    }

    function update() {

    }


    function render() {

        game.debug.text('points: ' + points.p1 + ' : ' + points.p2, 200, 300);
    }

})
;