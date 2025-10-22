import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must not exceed 5' })
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}