/**
 * @require Animator.js
 * @require Layer.js
 * @require Billiard.js
 */

function Game() {
    var billiard;
    var animator;
    var scale;
    var width, height;
    var bLayer;
    var aLayer;
    var tLayer;
    var mouseX, mouseY;
    var painter;

    function onframe( e ) {
        switch( billiard.getStatus() ) {
            case 'DYNAMIC': 
                billiard.go( e.deltaTime );
                renderWorld();
                break;
            case 'STATIC':
                // renderGuide();
                break;
        }
    }

    function onmousemove( e ) {
        mouseX = e.layerX;
        mouseY = e.layerY;
        if( billiard.getStatus() == 'STATIC' ) renderGuide();
    }

    function onmousedown( e ) {
        var mouseVector = new Vector( e.layerX, e.layerY );
        var ballVector = Vector.multipy( billiard.balls[0].s, scale );
        if(billiard.getStatus() == 'STATIC') {
            var speed = Vector.minus( mouseVector, ballVector );
            billiard.hit( Vector.multipy( speed, 3.5 / scale) );
            aLayer.ctx.clearRect(0, 0, width, height);
        }
    } 

    function onenterball( e ) {

    }

    function onhitball( balla, ballb ) {

    }

    function renderTable( ) {
        var w = billiard.TABLE_WIDTH,
            h = billiard.TABLE_HEIGHT,
            a = billiard.TABLE_OUTER_THICKNESS,
            b = billiard.TABLE_INNER_THICKNESS,
            d = billiard.BALL_DIAMETER,
            fw = w + ( a + b ) * 2,
            fh = h + ( a + b ) * 2,

        tLayer = new Layer(fw * scale, fh * scale, 0);
        painter.drawTable( tLayer.ctx, w, h, a, b, d, fw, fh );
    }

    function renderWorld() {
        painter.drawWorld( bLayer.ctx, billiard );
    }

    function renderGuide() {
        painter.drawGuid( aLayer.ctx, billiard, mouseX, mouseY );
    }

    function start() {
        renderTable();
        renderWorld();
        animator.start();
    }
    function init() {
        scale = 300;

        billiard = new Billiard();
        painter = new Painter( scale );
        animator = new Animator();

        billiard.on('enterball', onenterball);
        billiard.on('hitball', onhitball);

        animator.on('frame', onframe)

        width = billiard.TABLE_WIDTH * scale;
        height = billiard.TABLE_HEIGHT * scale;

        bLayer = new Layer( width, height, 1 );
        aLayer = new Layer( width, height, 2 );

        aLayer.canvas.addEventListener('mousemove', onmousemove);
        aLayer.canvas.addEventListener('mousedown', onmousedown);
        
    }
    init();
    this.start = start;
}

var game = new Game();
game.start();