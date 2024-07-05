import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId({ message: 'userId must be a valid MongoDB ObjectId' })
  userId: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Each assignee must be a valid MongoDB ObjectId' })
  assignees?: string[];

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @IsOptional()
  @IsDateString()
  deletedAt: Date;
}
