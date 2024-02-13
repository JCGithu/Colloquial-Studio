
import type { World } from "@dimforge/rapier2d";

export function newWorld(rap: RAPIER, width: number, height: number): World {
  let world = regenWorld(rap);
  loadWorld(rap, world, width, height);
  return world;
}

function regenWorld(rap: RAPIER) {
  let gravity = new rap.Vector2(0.0, 97.3);
  let world = new rap.World(gravity);
  console.log('New Rapier world generated');
  return world;
}

export function loadWorld(rap: RAPIER, world: World, width: number, height: number, redo?: boolean) {
  if (redo) world = regenWorld(rap);
  // Create the ground
  let groundBodyDesc = rap.RigidBodyDesc.fixed().setTranslation(0, height + 9);
  let groundBody = world.createRigidBody(groundBodyDesc);
  let groundColliderDesc = rap.ColliderDesc.cuboid(width, 10);
  let groundCollider = world.createCollider(groundColliderDesc, groundBody);
  groundCollider.setFriction(10);
  groundCollider.setRestitution(0);

  //Create left wall
  let leftWallBodyDesc = rap.RigidBodyDesc.fixed().setTranslation(-9, 0);
  let leftWallBody = world.createRigidBody(leftWallBodyDesc);
  let leftWallColliderDesc = rap.ColliderDesc.cuboid(10, height);
  world.createCollider(leftWallColliderDesc, leftWallBody);

  //Create right wall
  let rightWallBodyDesc = rap.RigidBodyDesc.fixed().setTranslation(width + 9, 0);
  let rightWallBody = world.createRigidBody(rightWallBodyDesc);
  let rightWallColliderDesc = rap.ColliderDesc.cuboid(10, height);
  world.createCollider(rightWallColliderDesc, rightWallBody);
}