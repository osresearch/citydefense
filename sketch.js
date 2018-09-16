/*
 */
let view_angle = 0.0;

function setup()
{
	createCanvas(windowWidth, windowHeight, WEBGL);
	background(0);
}

//function keyReleased() { }
//function keyPressed() { }
//function mousePressed() { }

function draw()
{
	background(0);

	camera(
		1000*sin(view_angle), 1000*cos(view_angle), 500,
		0, 0, 0, // look at the center of the board
		0, 0, -1, // up is positive Z, but this reference frame is wrong
	);

	fill(0);
	stroke(255,255,255);
	box(500, 500, 10);
	push();
	translate(0,0,11);
	box(200, 200, 10);
	pop();

	view_angle = view_angle + 0.01;
	if (view_angle > PI)
		view_angle -= PI;
}
