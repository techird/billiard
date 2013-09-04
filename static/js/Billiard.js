function Billiard() {

    var TABLE_WIDTH = this.TABLE_WIDTH = 2.81
      , TABLE_HEIGHT = this.TABLE_HEIGHT = 1.53
      , BALL_RADIUS = this.BALL_RADIUS = 0.05
      , BALL_DIAMETER = this.BALL_DIAMETER = BALL_RADIUS * 2
      , BALL_COUNT = 16
      , BALL_COLORS = [
            'white',    // 0
            'yellow',   // 1
            'blue',     // 2
            'red',      // 3
            'purple',   // 4
            'orange',   // 5
            'darkgreen',// 6
            'brown',    // 7
            'black',    // 8
            'yellow',   // 9
            'blue',     // 10
            'red',      // 11
            'purple',   // 12
            'orange',   // 13
            'darkgreen',// 14
            'brown']    // 15
      , FRICTION_ACCELERATION = 0.5
      , ZERO = 0.01
      , BALL_HIT_LOSE = 0.1
      , WALL_HIT_LOSE = 0.46;
    
    var balls = [], dynamicBalls = new Set();

    function layoutOnStart() {
        var classified = {
              '-1': [1, 2, 3, 4, 5, 6, 7],
               '0': [8],
               '1': [9, 10, 11, 12, 13, 14, 15]
            }
          , queue

          , triangle = [ [-1],
                        [1,-1], 
                       [-1,0,1],
                     [1,-1,1,-1],
                    [-1,1,1,-1,1]]

          , row, type, index, back

          , nextRowVector = new Vector( Math.sqrt(3) * BALL_RADIUS, -BALL_RADIUS )
          , nextElemVector = new Vector( 0, BALL_DIAMETER )
          , currentPos = new Vector( 0.75 * TABLE_WIDTH, 0.5 * TABLE_HEIGHT );

        balls[0].s = new Vector( 0.25 * TABLE_WIDTH, 0.5 * TABLE_HEIGHT );
        back = 1;
        while( row = triangle.shift() ) {
            while( (type = row.shift()) !== undefined ) {
                queue = classified[type];
                index = Math.floor(Math.random() * queue.length);
                index = queue.splice( index, 1 )[0];
                balls[index].s = currentPos;
                currentPos = Vector.add( currentPos, nextElemVector );
            }
            currentPos = Vector.add( currentPos, new Vector( 0, -BALL_DIAMETER * back++) );
            currentPos = Vector.add( currentPos, nextRowVector );
        }
    }

    function detectCollision() {
        var i, j, a, b, n, detected;
        for(i = 0; i < balls.length; i++) {
            a = balls[i]; 
            for(j = i + 1; j < balls.length ; j++) {
                b = balls[j];
                if( detectTwo( a, b ) ) {
                    dynamicBalls.add(a);
                    dynamicBalls.add(b);
                    //detected = true;
                }
            }
        }
        detected && detectCollision();
    }

    function detectTwo( a, b ) {
        if( a.v.length() <= ZERO && b.v.length() <= ZERO ) return false;

        // a connect from a to b
        var connect = Vector.minus( b.s, a.s );

        // v projection on the connect
        var avc = Vector.projection( a.v, connect ),
            bvc = Vector.projection( b.v, connect );

        // v delta on the connect
        var dvc = Vector.minus( avc, bvc );

        // should check the dcv same direction with the connect
        // and the two ball is close enougth
        if( Vector.dot(dvc, connect) > 0
            && connect.length() - BALL_DIAMETER <= ZERO ) {

            var normal = Vector.verticalVector( connect );

            var avn = Vector.projection( a.v, normal ),
                bvn = Vector.projection( b.v, normal );

            // 连线方向速度交换，垂直方向速度不变
            var factor = 1 - BALL_HIT_LOSE;
            a.v = Vector.multipy( Vector.add( avn , bvc ), factor);
            b.v = Vector.multipy( Vector.add( bvn , avc ), factor);

            // console.log('detected collision: ', a.index, b.index);
            return true;
        }
        return false;
    }

    function detectWall() {
        var ball, i = 0;
        while( ball = dynamicBalls[i] ) {
            var x = ball.s.x,
                y = ball.s.y,
                va = Vector.multipy( ball.v, (1 - WALL_HIT_LOSE) )
                vx = va.x,
                vy = va.y;
            if( x < BALL_RADIUS && vx < 0 || x > TABLE_WIDTH - BALL_RADIUS && vx > 0 ) {
                ball.v = new Vector( -vx , vy  );
            }
            if( y < BALL_RADIUS && vy < 0 || y > TABLE_HEIGHT - BALL_RADIUS && vy > 0 ) {
                if( x < BALL_DIAMETER || x > TABLE_WIDTH - BALL_DIAMETER ) {
                    ball.visible = false;
                } else {
                    ball.v = new Vector( vx , -vy  );
                }
            }
            ++i;
        }
    }

    function step() {
        var ball, i = 0, nStatic = 0;
        while( ball = dynamicBalls[i++] ) {
            ball.a = Vector.multipy( Vector.normalize( ball.v ), -FRICTION_ACCELERATION);
            ball.v = Vector.add( ball.v, Vector.multipy( ball.a, 1 / 1000 ) );
            ball.s = Vector.add( ball.s, Vector.multipy( ball.v, 1 / 1000 ) );
            if( ball.v.length() <= ZERO ) {
                ball.v = new Vector(0, 0);
                dynamicBalls.remove(ball);
                // console.log(dynamicBalls);
            }
        }
        detectCollision();
        detectWall();
    }

    function go( ms ) {
        while(dynamicBalls.length && ms--) step();
    }

    function hit( speed ) {
        balls[0].v = speed;
        dynamicBalls.add(balls[0]);
    }

    function reset() {
        balls = [];
        for(var i = 0; i < BALL_COUNT; i++) {
            balls.push({
                index: i,
                s: new Vector( 0, 0 ),
                v: new Vector( 0, 0 ),
                a: new Vector( 0, 0 ),
                c: BALL_COLORS[i],
                visible: true
            });
        }
        layoutOnStart();
    }

    reset();
    this.go = go;
    this.balls = balls;
    this.hit = hit;
    this.getStatus = function() {
        return dynamicBalls.length > 0 ? 'DYNAMIC' : 'STATIC';
    }
}