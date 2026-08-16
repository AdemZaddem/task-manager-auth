import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async allTasks(userId: number) {
    return await this.prisma.task.findMany({ where: { ownerId: userId } });
  }

  async oneTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, ownerId: userId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);
    return task;
  }

  async createTask(userId: number, createTask: CreateTaskDto) {
    return await this.prisma.task.create({ data: { ...createTask, ownerId: userId } });
  }

  async updateTask(userId: number, taskId: number, updateTask: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, ownerId: userId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);
    return await this.prisma.task.update({ where: { id: taskId }, data: { ...updateTask } });
  }

  async deleteTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, ownerId: userId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);
    return await this.prisma.task.delete({ where: { id: taskId } });
  }
}
