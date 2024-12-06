import { GROW_BY_FOOD_COEFFICIENT, MAP_SIZE } from '@/constants/game';

import {
  CameraModel,
  EnemyStatic,
  MapRegionModel,
  PlayerFeatureModel,
  PlayerModel,
} from './models';

import { STATUS } from './CanvasComponent.interface';

import { GenerateEnemy, GenerateFood, IsCollided } from './utils';
import { EnemyPlayerModel } from './models/EnemyPlayer.model';
import { isCollidedBySquare } from './utils/isCollidedBySquare';

export class CanvasController {
  public Map = new MapRegionModel();
  public Camera = new CameraModel();
  public Player = new PlayerModel({ X: 2000, Y: 2000, Radius: 2 });
  public EnemyPlayers: EnemyPlayerModel[] = [
    new EnemyPlayerModel({ X: 3000, Y: 3000, Radius: 10, ColorFill: 'red' }),
    new EnemyPlayerModel({ X: 1000, Y: 1000, Radius: 10, ColorFill: 'blue' }),
    new EnemyPlayerModel({ X: 3000, Y: 1000, Radius: 10, ColorFill: 'yellow' }),
    new EnemyPlayerModel({ X: 1000, Y: 3000, Radius: 10, ColorFill: 'yellow' }),
    new EnemyPlayerModel({ X: 2050, Y: 2050, Radius: 10, ColorFill: 'yellow' }),
  ];
  public FoodFields = GenerateFood({
    width: MAP_SIZE,
    height: MAP_SIZE,
  });
  public EnemyFields: EnemyStatic[] = [...GenerateEnemy({ width: MAP_SIZE, height: MAP_SIZE })];

  public MovePlayer(mouseX: number, mouseY: number) {
    this.Player.move(this.Camera, mouseX, mouseY);
    this.Player.moveDivision(this.Camera, mouseX, mouseY);
  }

  public MoveStatics() {
    for (const staticField of [...this.FoodFields, ...this.EnemyFields].filter(
      field => field.Movable,
    )) {
      staticField.move();
    }
  }

  public EnemyPlayersMove() {
    for (const enemys of this.EnemyPlayers) {
      enemys.move();
    }
  }

  public CollisionDetection() {
    const { Player } = this.Player;

    for (const element of this.EnemyPlayers) {
      if (element instanceof EnemyStatic) {
        continue;
      }

      if (isCollidedBySquare(element, Player) < Player.getAreaOfCircle() / 3) {
        continue;
      }

      if (Player.Radius <= element.Radius) {
        Player.Status = STATUS.DEAD;
        return;
      }

      // Если столкновение началось
      if (IsCollided(element, Player) && !element.isColliding) {
        element.isColliding = true;
        element.collisionTime = 0;

        const collisionAngle = Math.atan2(element.Y - Player.Y, element.X - Player.X);
        const deformationAmount = Math.min(element.Radius, Player.Radius) * 0.3;

        Player.DeformationX -= Math.cos(collisionAngle) * deformationAmount;
        Player.DeformationY -= Math.sin(collisionAngle) * deformationAmount;

        element.DeformationX += Math.cos(collisionAngle) * deformationAmount;
        element.DeformationY += Math.sin(collisionAngle) * deformationAmount;
      }

      if (element.isColliding) {
        element.collisionTime++;

        if (element.collisionTime > 30) {
          Player.Radius += element.Radius / 2;
          Player.Score += 10;
          element.Destroy();
          element.Status = STATUS.DEAD;
          element.isColliding = false;
        }
      }
    }

    this.EnemyPlayers = this.EnemyPlayers.filter(el => el.Status !== STATUS.DEAD);
  }

  public CollisionFoodDetection() {
    for (const element of this.FoodFields) {
      if (element.Status !== STATUS.ALIVE) {
        continue;
      }
      for (const target of [
        ...this.Player.Divisions,
        /** поедание подкормки статической бактерией врагом */
        ...this.EnemyFields,
        /** поедание ботами */
        ...this.EnemyPlayers,
        this.Player.Player,
      ]) {
        if (!IsCollided(element, target)) {
          continue;
        }
        if (IsCollided(element, this.Player.Player)) {
          const collisionAngle = Math.atan2(
            element.Y - this.Player.Player.Y,
            element.X - this.Player.Player.X,
          );
          const deformationAmount = Math.min(element.Radius, this.Player.Player.Radius) * 0.3;

          // Применяем деформацию
          this.Player.Player.DeformationX -= Math.cos(collisionAngle) * deformationAmount;
          this.Player.Player.DeformationY -= Math.sin(collisionAngle) * deformationAmount;

          element.DeformationX += Math.cos(collisionAngle) * deformationAmount;
          element.DeformationY += Math.sin(collisionAngle) * deformationAmount;
        }
        target.Radius = target.Radius + element.Radius * GROW_BY_FOOD_COEFFICIENT;
        element.Status = STATUS.DEAD;
        if (target instanceof EnemyStatic) {
          target.prepareMove(element.X, element.Y);
        }
        if (target instanceof PlayerFeatureModel) {
          target.Score++;
        }
      }
    }
  }

  public CollisionEnemyDetection() {
    for (const element of this.EnemyFields) {
      if (element instanceof EnemyPlayerModel) {
        if (IsCollided(element, this.Player.Player)) {
          if (this.Player.Player.Radius <= element.Radius) {
            /** @TODO там как-то разлетается он вроде */
            this.Player.Player.Status = STATUS.DEAD;
            return;
          }

          const collisionAngle = Math.atan2(
            element.Y - this.Player.Player.Y,
            element.X - this.Player.Player.X,
          );
          const deformationAmount = Math.min(element.Radius, this.Player.Player.Radius) * 0.3;

          this.Player.Player.DeformationX -= Math.cos(collisionAngle) * deformationAmount;
          this.Player.Player.DeformationY -= Math.sin(collisionAngle) * deformationAmount;

          element.DeformationX += Math.cos(collisionAngle) * deformationAmount;
          element.DeformationY += Math.sin(collisionAngle) * deformationAmount;
        }
      }
    }
  }

  public DrawAll(ctx: CanvasRenderingContext2D) {
    this.DrawFood(ctx);
    for (const item of [
      ...this.EnemyPlayers,
      ...this.EnemyFields,
      ...this.Player.Divisions,
      this.Player.Player,
    ].sort((a, b) => a.Radius - b.Radius)) {
      if (item.Status === STATUS.ALIVE) {
        item.draw(ctx);
      }
    }
  }

  public DrawFood(ctx: CanvasRenderingContext2D) {
    for (const food of this.FoodFields) {
      if (food.Status === STATUS.ALIVE) {
        food.draw(ctx);
      }
    }
  }

  public DrawGrid(ctx: CanvasRenderingContext2D) {
    const gridSize = 5;
    const cameraX = this.Camera.X;
    const cameraY = this.Camera.Y;

    const canvasWidth = ctx.canvas.width / this.Camera.Scale;
    const canvasHeight = ctx.canvas.height / this.Camera.Scale;

    const offsetX = -(cameraX % gridSize);
    const offsetY = -(cameraY % gridSize);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.strokeStyle = '$app-cell-color';
    ctx.lineWidth = 0.1;

    for (let x = offsetX; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x * this.Camera.Scale, 0);
      ctx.lineTo(x * this.Camera.Scale, canvasHeight * this.Camera.Scale);
      ctx.stroke();
    }

    for (let y = offsetY; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.Camera.Scale);
      ctx.lineTo(canvasWidth * this.Camera.Scale, y * this.Camera.Scale);
      ctx.stroke();
    }

    ctx.restore();
  }
}
