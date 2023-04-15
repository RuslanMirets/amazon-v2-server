import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { GetAllProductDto } from "./dto/get-all.product.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ProductDto } from "./dto/product.dto";

@Controller("product")
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@UsePipes(new ValidationPipe())
	@Get()
	async getAll(@Query() dto: GetAllProductDto) {
		return this.productService.getAll(dto);
	}

	@Auth()
	@Get(":id")
	async getBydId(@Param("id") id: string) {
		return this.productService.byId(+id);
	}

	@Get("similar/:id")
	async getSimilar(@Param("id") id: string) {
		return this.productService.getSimilar(+id);
	}

	@Get("by-slug/:slug")
	async getBySlug(@Param("slug") slug: string) {
		return this.productService.bySlug(slug);
	}

	@Get("by-category/:id")
	async getByCategory(@Param("id") id: string) {
		return this.productService.byCategory(id);
	}

	@HttpCode(200)
	@Auth()
	@Post()
	async create() {
		return this.productService.create();
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	@Put(":id")
	async update(@Param("id") id: string, @Body() dto: ProductDto) {
		return this.productService.update(+id, dto);
	}

	@HttpCode(200)
	@Auth()
	@Delete(":id")
	async delete(@Param("id") id: string) {
		return this.productService.delete(+id);
	}
}
