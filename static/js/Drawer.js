function Drawer ( ctx ) {
	this.ctx = ctx;
}

Drawer.prototype = {
	constructor: Drawer,
	drawRoundedRectangle: function( x, y, w, h, r ) {
		with ( this.ctx ) {
			save();
			translate( x, y );
			beginPath();
			moveTo( r, 0 );
			lineTo( w - r, 0);
			arcTo( w, 0, w, r, r);
			lineTo( w, h - r );
			arcTo( w, h, w - r, h, r);
			lineTo( r, h );
			arcTo( 0, h, 0, h - r, r);
			lineTo( 0, r );
			arcTo(0, 0, r, 0, r);
			closePath();
			restore();
		}
	}
}