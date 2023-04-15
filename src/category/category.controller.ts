import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CategoryDto } from "./category.dto";

@Controller("category")
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	async getAll() {
		return this.categoryService.getAll();
	}

	@Auth()
	@Get(":id")
	async getBydId(@Param("id") id: string) {
		return this.categoryService.byId(+id);
	}

	@Get("by-slug/:slug")
	async getBySlug(@Param("slug") slug: string) {
		return this.categoryService.bySlug(slug);
	}

	@HttpCode(200)
	@Auth()
	@Post()
	async create() {
		return this.categoryService.create();
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	@Put(":id")
	async update(@Param("id") id: string, @Body() dto: CategoryDto) {
		return this.categoryService.update(+id, dto);
	}

	@HttpCode(200)
	@Auth()
	@Delete(":id")
	async delete(@Param("id") id: string) {
		return this.categoryService.delete(+id);
	}
}
