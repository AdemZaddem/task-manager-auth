import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseInterceptor } from 'src/common/interceptors/response/response.interceptor';

@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return await this.taskService.allTasks(user.sub);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return await this.taskService.oneTask(user.sub, id);
  }

  @Post()
  async createTask(@CurrentUser() user: JwtPayload, @Body() task: CreateTaskDto) {
    return await this.taskService.createTask(user.sub, task);
  }

  @Put(':id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() update: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.taskService.updateTask(user.sub, id, update);
  }

  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return await this.taskService.deleteTask(user.sub, id);
  }
}
