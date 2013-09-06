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
    var tLayer;
    var mouseX, mouseY;

    function onframe( e ) {
        switch( billiard.getStatus() ) {
            case 'DYNAMIC': 
                billiard.go( e.deltaTime );
                renderBilliard();
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
    function renderTable( ) {
        var w = billiard.TABLE_WIDTH,
            h = billiard.TABLE_HEIGHT,
            a = billiard.TABLE_OUTER_THICKNESS,
            b = billiard.TABLE_INNER_THICKNESS,
            d = billiard.BALL_DIAMETER,
            fw = w + ( a + b ) * 2,
            fh = h + ( a + b ) * 2,
            PI = Math.PI,
            RC = PI / 2;

        tLayer = new Layer(fw * scaleFactor, fh * scaleFactor, 0);

        var ctx = tLayer.ctx;
        ctx.scale( scaleFactor, scaleFactor );

        var drawer = new Drawer( ctx );
        ctx.fillStyle = 'rgb(90, 47, 22)';
        drawer.drawRoundedRectangle(0, 0, fw, fh, a);
        ctx.fill();

        ctx.fillStyle = 'darkgreen';
        drawer.drawRoundedRectangle(a, a, fw - a * 2, fh - a * 2, b);
        ctx.fill();

        ctx.fillStyle = 'green';
        ctx.fillRect(a + b, a + b, fw-a-a-b-b, fh-a-a-b-b);

        var r = (d / 2) * Math.sqrt(2);
        function drawHole() {            
            ctx.beginPath();
            ctx.moveTo(a + b, a);
            ctx.lineTo(a + d, a);
            ctx.lineTo(a + b + d, a + b);
            ctx.lineTo(a + b, a + b + d);
            ctx.lineTo(a, a + d);
            ctx.arcTo(a, a, a + b, a, b);
            ctx.closePath();
            ctx.fillStyle = 'green';
            ctx.fill();

            var holeColor = ctx.createRadialGradient(a + d, a + d, 0, a + b, a + b, r);
            holeColor.addColorStop(0, 'black');
            holeColor.addColorStop(1, '#223322');
            ctx.beginPath();
            ctx.arc(a + b, a + b, r , 0 , PI * 2);
            ctx.fillStyle = holeColor;
            ctx.fill();
        }
        drawHole();

        ctx.save();
        ctx.translate( fw , 0 );
        ctx.rotate(RC);
        drawHole();
        ctx.restore();

        ctx.save();
        ctx.translate( fw, fh );
        ctx.rotate(PI);
        drawHole();
        ctx.restore();

        ctx.save();
        ctx.translate(0, fh);
        ctx.rotate(PI + RC);
        drawHole();
        ctx.restore();

        function drawHole2() {
            ctx.beginPath();
            ctx.moveTo(fw / 2 - r, a);
            ctx.lineTo(fw / 2 + r, a);
            ctx.lineTo(fw / 2 + r + b / 2, a + b * 2);
            ctx.lineTo(fw /2 - r - b / 2, a + b * 2);
            ctx.lineTo(fw / 2 - r, a );
            ctx.closePath();
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.beginPath();
            ctx.arc( fw / 2, a, r, 0, PI * 2);
            var holeColor = ctx.createRadialGradient(fw / 2, a + b, 0, fw / 2, a, r);
            holeColor.addColorStop(0, 'black');
            holeColor.addColorStop(1, '#223322');
            ctx.fillStyle = holeColor;
            ctx.fill();
        }
        drawHole2();

        ctx.save();
        ctx.translate(fw, fh);
        ctx.rotate(PI);
        drawHole2();
        ctx.restore();
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

            ctx.fillStyle = 'white';
            ball.index < 8 && fillBall( ctx, x, y, r * 0.55 );
            //ball.index > 8 && fillBall( ctx, x, y, r * 0.75 );

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
                ctx.font = '12px Arial'
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText( i.toString(), x * scaleFactor, y * scaleFactor );
            }
            ++i;
        }
    }
    function dotLineTo(ctx, sx, sy, ex, ey, stepLength) {
        stepLength = stepLength || 5 / scaleFactor;
        var s = new Vector( ex - sx, ey - sy);
        var step = Vector.normalize( s, stepLength );
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
        var ctx = aLayer.ctx;
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.scale( scaleFactor, scaleFactor );            
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 1 / scaleFactor;

        var whiteBall = billiard.balls[0];
        var sw = whiteBall.s;
        var sm = new Vector( mouseX / scaleFactor, mouseY / scaleFactor );
        var v = Vector.minus( sm, sw );

        ctx.beginPath();
        ctx.arc( sw.x, sw.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc( sm.x, sm.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
        ctx.fill();

        var latestHit;
        if( latestHit = billiard.detectLatestHit( v )) {
            var pw = latestHit.pw,
                vw = latestHit.vw,
                vt = latestHit.vt,
                vwl = vw.length(),
                vtl = vt.length(),
                st = latestHit.ball.s,
                hsw = Vector.add(pw, Vector.normalize(vw, vwl / (vwl + vtl))),
                hst = Vector.add(st, Vector.normalize(vt, vtl / (vwl + vtl)));

            ctx.beginPath();
            ctx.moveTo(sw.x, sw.y); // 白球位置
            ctx.lineTo(pw.x, pw.y); // 白球碰撞位置
            ctx.lineTo(hsw.x, hsw.y); // 白球碰撞后方向所指位置
            ctx.stroke();

            ctx.beginPath();
            ctx.arc( pw.x, pw.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc( pw.x, pw.y, billiard.BALL_RADIUS, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo( st.x, st.y );
            ctx.lineTo( hst.x, hst.y );
            ctx.stroke();

            ctx.beginPath();
            ctx.arc( st.x, st.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc( st.x, st.y, billiard.BALL_RADIUS, 0, Math.PI * 2);
            ctx.stroke();

            if(Vector.dot(Vector.minus(pw, sw), Vector.minus(sm, pw)) > 0) {
                ctx.beginPath();
                dotLineTo(ctx, pw.x, pw.y, sm.x, sm.y);
                ctx.stroke();
            }
        } else {
            ctx.beginPath();
            dotLineTo(ctx, sw.x, sw.y, sm.x, sm.y);
            ctx.stroke();
        }

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

        renderTable();

        width = billiard.TABLE_WIDTH * scaleFactor;
        height = billiard.TABLE_HEIGHT * scaleFactor;

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