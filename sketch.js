/*
 */
let fps = 30;
let view_angle = 0;
let rotate_angle = 0;

let camera_distance = 500;
let camera_height = 250;
let camera_pos;

let num_cities = 5; // per side, so num_cities^2 - 1
let city_size = 200;
let world_size = num_cities * city_size;
let rock;
let cities;
let target;


class City
{
	constructor() {
		this.health = 16;
	}

	draw() {
		push();
		strokeWeight(1);
		translate(city_size/5, city_size/5, 0);

		if (this.health > 10)
			stroke(0,0,255);
		else
		if (this.health > 4)
			stroke(255,255,0);
		else
			stroke(255,0,0);

		for(let x=0; x < 4 ; x++)
		{
			for( let y=0 ; y < 4 ; y++)
			{
				if (x * 4 + y > this.health)
					break;
				push();
				translate(x*city_size/5, y*city_size/5, 0);
				box(city_size/5.1, city_size/5.1, city_size/4);
				pop();
			}
		}
		pop();
	}
}

class Rock
{
        constructor() {
                // pick a random starting position
		this.s = createVector(
			random(-world_size,world_size),
			random(-world_size,world_size),
			camera_height * 2
		);
		this.p = this.s.copy();
		this.t = createVector(
			random(-world_size/2, world_size/2),
			random(-world_size/2, world_size/2),
			0
		);

		this.v = p5.Vector.sub(this.t, this.p).setMag(random(1,10));
	}

	step(dt) {
		this.p.add(this.v);
	}

	hit() {
		if (this.p.z > 0)
			return false;
		return true;
	}

	draw() {
		if (this.p.z > 100)
			stroke(0,255,0);
		else
		if (this.p.z > 50)
			stroke(255,255,0);
		else
			stroke(255,0,0);
		line(
			this.s.x, this.s.y, this.s.z,
			this.p.x, this.p.y, this.p.z
		);

		push();
		translate(this.t.x, this.t.y, this.t.z+city_size/4);
		stroke(255,0,0,40);
		sphere(10);
		pop();
	}
}


function setup()
{
	camera_pos = createVector(0,0,0);
	createCanvas(windowWidth, windowHeight, WEBGL);
	background(0);
	frameRate(fps);
	view_angle = PI/4;

	cities = [];

	for(let x = 0 ; x < num_cities ; x++)
	{
		cities[x] = [];
		for(let y = 0 ; y < num_cities ; y++)
		{
			if (x == int(num_cities/2) && y == int(num_cities/2))
				continue;
			cities[x][y] = new City();
		}
	}
}

function keyReleased() 
{
	if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW)
		rotate_angle = 0;
}

function keyPressed()
{
	if (keyCode == LEFT_ARROW)
		rotate_angle = -1;
	else
	if (keyCode == RIGHT_ARROW)
		rotate_angle = +1;
	else
	if (key == ' ')
		view_angle = 0;
}

// function mouseWheel(event) -- event.delta has the speed of rotation

function mousePressed()
{
	// translate the mouse screen XY into an world XYZ coordinate
	let mx = (mouseX - windowWidth/2) / (windowWidth/2);
	let my = (mouseY - windowHeight/2) / (windowHeight/2);

	let fov_y = 30 * PI / 180;
	let fov_x = fov_y * windowWidth / windowHeight;

	// the viewpoint is 2*camera_distance away and camera_height below
	let tilt = -atan2(-camera_height, 2 * camera_distance) + my * fov_y;

	target = createVector(
		1.2 * camera_distance * cos(tilt),
		1.2 * camera_distance * sin(mx * fov_x),
		1.2 * camera_distance * sin(tilt)
	);
	

	let tx = camera_pos.x + ( target.x * cos(view_angle+PI) - target.y * sin(view_angle+PI) );
	let ty = camera_pos.y + ( target.x * sin(view_angle+PI) + target.y * cos(view_angle+PI) );
	let tz = camera_pos.z - target.z;

	console.log(mx + "," + my + " => " + tx + "," + ty + "," + tz);
	target = createVector(tx,ty,tz);

	return false;
}


function draw()
{
	view_angle = view_angle + rotate_angle * (1.0/fps);
	if (view_angle > 2*PI)
		view_angle -= 2*PI;
	if (view_angle < 0)
		view_angle += 2*PI;

	background(0);

	camera_pos.x = camera_distance*cos(view_angle);
	camera_pos.y = camera_distance*sin(view_angle);
	camera_pos.z = camera_height;

	camera(
		camera_pos.x, camera_pos.y, camera_pos.z,
		camera_distance*cos(view_angle+PI), camera_distance*sin(view_angle+PI), 0,
		0, 0, -1, // up is positive Z, but this reference frame is wrong
	);

	fill(0);

	if (target)
	{
		push();
		stroke(255,0,80);
		translate(target.x, target.y, target.z);
		sphere(20);
		pop();
	}

	push();
	strokeWeight(1);
	stroke(255,255,255);
	translate(0,0,-city_size/4-5);
	box(world_size, world_size, 2);
	pop();

	if (!rock)
	{
		rock = new Rock();
	} else
	if (rock.hit())
	{
		// should make this persist, grow bigger, etc
		push();
		stroke(255,0,0);
		translate(rock.p.x, rock.p.y, 0);
		sphere(20);
		pop();

console.log(rock.p.x + "," + rock.p.y);
		// if there is a city there, decrement its health
		let cx = int((rock.p.x+world_size/2) / city_size);
		let cy = int((rock.p.y+world_size/2) / city_size);
		if (cx >= 0 && cy >= 0 && cx < num_cities && cy < num_cities)
			cities[cx][cy].health -= 7;

		rock = false;
	} else {
		rock.step(1.0/fps);

		stroke(0,255,0);
		strokeWeight(5);
		rock.draw();
	}

	push();
	translate(-world_size/2, -world_size/2, -city_size/4);
	for(let x = 0 ; x < num_cities ; x++)
	{
		for(let y = 0 ; y < num_cities ; y++)
		{
			push();
			translate(
				x * city_size,
				y * city_size,
				0
			);
			if (cities[x][y])
				cities[x][y].draw();
			pop();
		}
	}
	pop();
}
