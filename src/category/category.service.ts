import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CategoryDto } from "./category.dto";
import slugify from "slugify";
import { returnCategoryObject } from "./return-category.object";

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async byId(id: number) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			select: returnCategoryObject,
		});

		if (!category) throw new NotFoundException("Category not found");

		return category;
	}

	async bySlug(slug: string) {
		const category = await this.prisma.category.findUnique({
			where: { slug },
			select: returnCategoryObject,
		});

		if (!category) throw new NotFoundException("Category not found");

		return category;
	}

	async getAll() {
		return this.prisma.category.findMany({
			select: returnCategoryObject,
		});
	}

	async create() {
		return this.prisma.category.create({
			data: {
				name: "",
				slug: "",
			},
		});
	}

	async update(id: number, dto: CategoryDto) {
		return this.prisma.category.update({
			where: { id },
			data: {
				name: dto.name,
				slug: slugify(dto.name, { lower: true }),
			},
		});
	}

	async delete(id: number) {
		return this.prisma.category.delete({
			where: { id },
		});
	}
}