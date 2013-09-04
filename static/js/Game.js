/**
 * @require Animator.js
 * @require Layer.js
 * @require Billiard.js
 */

function Game() {
    var billiard;
    var animator;
    var scaleFactor;
    var width, height;
    var bLayer;
    var aLayer;
    var mouseX, mouseY;

    function onframe( e ) {
        switch( billiard.getStatus() ) {
            case 'DYNAMIC': 
                billiard.go( e.deltaTime );
                renderBilliard();
                break;
            case 'STATIC':
                renderGuide();
                break;
        }
    }
    function onmousemove( e ) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
    function onmousedown( e ) {
        var mouseVector = new Vector( e.layerX, e.layerY );
        var ballVector = Vector.multipy( billiard.balls[0].s, scaleFactor );
        if(billiard.getStatus() == 'STATIC') {
            var speed = Vector.minus( mouseVector, ballVector );
            billiard.hit( Vector.multipy( speed, 3.5 / scaleFactor) );
            aLayer.ctx.clearRect(0, 0, width, height);
        }
    } 
    function fillBall( ctx, x, y, r ) {
        ctx.beginPath();
        ctx.arc( x, y, r , 0, Math.PI * 2 );
        ctx.fill();
    }
    function getShadowOverlay( ctx, x, y, r ) {
        var ballOverlay = ctx.createRadialGradient( x, y, r * 0.1, x, y, r );
        ballOverlay.addColorStop(0, 'rgba(0,0,0,.1)');
        ballOverlay.addColorStop(1, 'rgba(0,0,0,.6)');
        return ballOverlay;
    }    
    function getHilightOverlay( ctx, x, y, r ) {
        var ballOverlay = ctx.createRadialGradient( x - r * 0.4, y - r * 0.4, r * 0.2, x, y, r );
        ballOverlay.addColorStop(0, 'rgba(255,255,255,.5)');
        ballOverlay.addColorStop(1, 'rgba(255,255,255,.0)');
        return ballOverlay;
    }
    function renderBilliard() {
        var ctx = bLayer.ctx;
        var i, ball, x, y, r;

        ctx.clearRect( 0, 0, width, height );

        i = 0; r = billiard.BALL_RADIUS;
        while( ball = billiard.balls[i] ) {
            if(!ball.visible && ++i) continue;
            ctx.save();

            ctx.scale(scaleFactor, scaleFactor);

            x = ball.s.x;
            y = ball.s.y;

            ctx.fillStyle = ball.c;
            fillBall( ctx, x, y, r );

            ctx.fillStyle = getShadowOverlay( ctx, x, y, r );            
            fillBall( ctx, x, y, r );

            ctx.fillStyle = getHilightOverlay( ctx, x, y, r );
            fillBall( ctx, x, y, r );

            if(ball.v.length()) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1 / scaleFactor;
                ctx.stroke();
            }

            ctx.restore();

            if( i > 0 ) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText( i.toString(), x * scaleFactor, y * scaleFactor );
            }
            ++i;
        }
    }
    function dotLineTo(ctx, sx, sy, ex, ey, stepLength) {
        stepLength = stepLength || 5;
        var s = new Vector( ex - sx, ey - sy);
        var step = Vector.multipy( Vector.normalize( s ), stepLength);
        var nx, ny;
        var current = new Vector( sx, sy );
        var count = Math.floor( s.length() / stepLength );
        ctx.moveTo(sx, sy);
        while(count--) {
            count % 2 ? ctx.moveTo( current.x, current.y ) : ctx.lineTo( current.x, current.y);
            current = Vector.add( current, step );
        }
    }
    function renderGuide() {
        var ballX, ballY, ctx;
        ballX = billiard.balls[0].s.x * scaleFactor;
        ballY = billiard.balls[0].s.y * scaleFactor;
        ctx = aLayer.ctx;
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.beginPath();
        dotLineTo(ctx, ballX, ballY, mouseX, mouseY);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
    }
    function start() {
        renderBilliard();
        animator.start();
    }
    function init() {
        billiard = new Billiard();
        animator = new Animator();
        animator.on('frame', onframe)
        scaleFactor = 300;
        width = billiard.TABLE_WIDTH * scaleFactor;
        height = billiard.TABLE_HEIGHT * scaleFactor;
        bLayer = new Layer( width, height, 0 );
        bLayer.canvas.style.background = 'green';
        aLayer = new Layer( width, height, 1 );
        aLayer.canvas.addEventListener('mousemove', onmousemove);
        aLayer.canvas.addEventListener('mousedown', onmousedown);
    }
    init();
    this.start = start;
}

var game = new Game();
game.start();