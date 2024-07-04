import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/createTaskDto';
import { UpdateTaskDto } from './dto/updateTaskDto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from 'src/schemas/TaskSchema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/UserSchema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Check if the user exists
    const user = await this.userModel.findById(createTaskDto.userId);
    if (!user) {
      throw new NotFoundException(`User #${createTaskDto.userId} not found`);
    }

    // Check if all assignees exist
    if (createTaskDto.assignees && createTaskDto.assignees.length > 0) {
      const assignees = await this.userModel.find({
        _id: { $in: createTaskDto.assignees },
      });
      if (assignees.length !== createTaskDto.assignees.length) {
        throw new NotFoundException('One or more assignees not found');
      }
    }

    const newTask = new this.taskModel({
      ...createTaskDto,
      user: createTaskDto.userId,
    });

    await newTask.save();
    return this.taskModel
      .findById(newTask._id)
      .populate('user', 'id name')
      .populate('assignees', 'id name')
      .exec();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel
      .find()
      .populate('user', 'id name')
      .populate('assignees', 'id name')
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate('user', 'id name')
      .populate('assignees', 'id name')
      .exec();
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // If updateTaskDto includes a userId, verify the user exists
    if (updateTaskDto.userId) {
      const user = await this.userModel.findById(updateTaskDto.userId);
      if (!user) {
        throw new NotFoundException(`User #${updateTaskDto.userId} not found`);
      }
    }

    // Check if all assignees exist
    if (updateTaskDto.assignees && updateTaskDto.assignees.length > 0) {
      const assignees = await this.userModel.find({
        _id: { $in: updateTaskDto.assignees },
      });
      if (assignees.length !== updateTaskDto.assignees.length) {
        throw new NotFoundException('One or more assignees not found');
      }
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('user', 'id name')
      .populate('assignees', 'id name')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task #${id} not found`);
    }
  }

  async search(searchTaskDto: any): Promise<Task[]> {
    return this.taskModel
      .find(searchTaskDto)
      .populate('user', 'id name')
      .populate('assignees', 'id name')
      .exec();
  }
}
