/*
 */
let fps = 30;
let view_angle = 0.0;
let camera_distance = 1000;
let num_cities = 5; // per side, so num_cities^2 - 1
let city_size = camera_distance / num_cities;
let rock;
let cities;


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
			random(-camera_distance,camera_distance),
			random(-camera_distance,camera_distance),
			camera_distance/2
		);
		this.p = this.s.copy();
		let t = createVector(
			random(-camera_distance/2, camera_distance/2),
			random(-camera_distance/2, camera_distance/2),
			0
		);

		this.v = p5.Vector.sub(t, this.p).setMag(random(1,10));
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
		line(
			this.s.x, this.s.y, this.s.z,
			this.p.x, this.p.y, this.p.z
		);
	}
}


function setup()
{
	createCanvas(windowWidth, windowHeight, WEBGL);
	background(0);
	frameRate(fps);

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

//function keyReleased() { }
//function keyPressed() { }
//function mousePressed() { }


function draw()
{
	view_angle = view_angle + 0.01;
	if (view_angle > 2*PI)
		view_angle -= 2*PI;

	background(0);

	camera(
		camera_distance*sin(view_angle), camera_distance*cos(view_angle), camera_distance/2,
		0, 0, 0, // look at the center of the board
		0, 0, -1, // up is positive Z, but this reference frame is wrong
	);

	fill(0);

	push();
	strokeWeight(1);
	stroke(255,255,255);
	translate(0,0,-11);
	box(camera_distance, camera_distance, 10);
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
		let cx = int((rock.p.x+camera_distance/2) / city_size);
		let cy = int((rock.p.y+camera_distance/2) / city_size);
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
	translate(-camera_distance/2, -camera_distance/2, 0);
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
