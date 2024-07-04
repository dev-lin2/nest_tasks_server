import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class SearchTaskDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
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
    createdAt: Date;

    @IsOptional()
    @IsDateString()
    updatedAt: Date;

    @IsOptional()
    @IsDateString()
    deletedAt: Date;
}