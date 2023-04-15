import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
	returnProductObject,
	returnProductObjectFullest,
} from "./return-product.object";
import { ProductDto } from "./dto/product.dto";
import slugify from "slugify";
import { EnumProductSort, GetAllProductDto } from "./dto/get-all.product.dto";
import { PaginationService } from "src/pagination/pagination.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProductService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService,
	) {}

	async getAll(dto: GetAllProductDto = {}) {
		const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];

		if (dto.sort === EnumProductSort.LOW_PRICE) {
			prismaSort.push({ price: "asc" });
		} else if (dto.sort === EnumProductSort.HIGH_PRICE) {
			prismaSort.push({ price: "desc" });
		} else if (dto.sort === EnumProductSort.NEWEST) {
			prismaSort.push({ createdAt: "asc" });
		} else if (dto.sort === EnumProductSort.OLDEST) {
			prismaSort.push({ createdAt: "desc" });
		}

		const prismaSearchTermFilter: Prisma.ProductWhereInput = dto.searchTerm
			? {
					OR: [
						{
							category: {
								name: { contains: dto.searchTerm, mode: "insensitive" },
							},
						},
						{ name: { contains: dto.searchTerm, mode: "insensitive" } },
						{ description: { contains: dto.searchTerm, mode: "insensitive" } },
					],
			  }
			: {};

		const { perPage, skip } = this.paginationService.getPagination(dto);

		const product = await this.prisma.product.findMany({
			where: prismaSearchTermFilter,
			orderBy: prismaSort,
			skip,
			take: perPage,
		});

		return {
			product,
			length: await this.prisma.product.count({
				where: prismaSearchTermFilter,
			}),
		};
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: returnProductObjectFullest,
		});

		if (!product) throw new NotFoundException("Product not found");

		return product;
	}

	async bySlug(slug: string) {
		const product = await this.prisma.product.findUnique({
			where: { slug },
			select: returnProductObjectFullest,
		});

		if (!product) throw new NotFoundException("Product not found");

		return product;
	}

	async byCategory(categorySlug: string) {
		const product = await this.prisma.product.findMany({
			where: { category: { slug: categorySlug } },
			select: returnProductObjectFullest,
		});

		if (!product) throw new NotFoundException("Product not found");

		return product;
	}

	async getSimilar(id: number) {
		const currentProduct = await this.byId(id);

		if (!currentProduct)
			throw new NotFoundException("Current product not found");

		const product = await this.prisma.product.findMany({
			where: {
				category: { name: currentProduct.category.name },
				NOT: { id: currentProduct.id },
			},
			orderBy: { createdAt: "desc" },
			select: returnProductObject,
		});

		return product;
	}

	async create() {
		const product = await this.prisma.product.create({
			data: {
				name: "",
				description: "",
				price: 0,
				slug: "",
			},
		});

		return product.id;
	}

	async update(id: number, dto: ProductDto) {
		return this.prisma.product.update({
			where: { id },
			data: {
				name: dto.name,
				description: dto.description,
				price: dto.price,
				images: dto.images,
				slug: slugify(dto.name, { lower: true }),
				category: {
					connect: { id: dto.categoryId },
				},
			},
		});
	}

	async delete(id: number) {
		return this.prisma.product.delete({ where: { id } });
	}
}
