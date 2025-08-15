"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProducts, updateProduct, deleteProduct, addProduct } from "@/lib/supabase/utils";

export interface Product {
  id?: number;
  created_at?: Date;
  product_name: string;
  product_description: string;
  product_price: number;
  product_isSale?: boolean;
  product_priceSale?: number;
  product_brand: string;
  product_image?: string;
  product_status?: string;
  product_stock?: number;
  product_quantity?: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isSale: "false",
    priceSale: "",
    category: "",
    image: "",
    stock: "",
    status: "active" as "active" | "inactive" | "out-of-stock",
  });

  // Obtener marcas únicas de productos
  const fetchBrands = (productsList: Product[]) => {
    const uniqueBrands = Array.from(
      new Set(productsList.map((p) => p.product_brand).filter(Boolean))
    );
    setBrands(uniqueBrands);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetailDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleAddProduct = async () => {
    const newProduct: Product = {
      product_name: formData.name,
      product_description: formData.description,
      product_price: Number.parseFloat(formData.price),
      product_isSale: formData.isSale === "true",
      product_priceSale: formData.priceSale
        ? Number.parseFloat(formData.priceSale)
        : undefined,
      product_brand: formData.category,
      product_image: formData.image,
      product_stock: Number.parseInt(formData.stock),
      product_status: formData.status,
      created_at: new Date(),
    };
    await addProduct(newProduct);
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    try {
      const updates = {
        product_name: formData.name,
        product_description: formData.description,
        product_price: Number.parseFloat(formData.price),
        product_brand: formData.category,
        product_stock: Number.parseInt(formData.stock),
        product_status: formData.status,
      };
      await updateProduct(selectedProduct.id!, updates);
      await getProducts();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id!);
      await getProducts();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.product_name,
      description: product.product_description,
      price: product.product_price.toString(),
      isSale: product.product_isSale ? "true" : "false",
      priceSale: product.product_priceSale ? product.product_priceSale.toString() : "",
      category: product.product_brand,
      image: product.product_image || "",
      stock: product.product_stock?.toString() || "",
      status: (product.product_status as "active" | "inactive" | "out-of-stock") || "active",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      isSale: "false",
      priceSale: "",
      category: "",
      image: "",
      stock: "",
      status: "active",
    });
    setSelectedProduct(null);
  };

  const getStatusBadge = (status: Product["product_status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      const products = await getProducts();
      setProducts(products);
      fetchBrands(products);
    };
    fetchProductsAndBrands();
  }, []);

  return (
    <div className="space-y-6 p-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Administra tu inventario y detalles de productos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar nuevo producto</DialogTitle>
              <DialogDescription>
                Crea un nuevo producto para tu inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Introduce el nombre del producto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Introduce la descripción del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isSale">¿En oferta?</Label>
                <Select
                  value={formData.isSale}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isSale: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Falso</SelectItem>
                    <SelectItem value="true">Verdadero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priceSale">Precio en oferta ($)</Label>
                <Input
                  id="priceSale"
                  type="number"
                  step="0.01"
                  value={formData.priceSale}
                  onChange={(e) =>
                    setFormData({ ...formData, priceSale: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Imagen (URL)</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Marca</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "active" | "inactive" | "out-of-stock"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="out-of-stock">Sin stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>
                Agregar producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos activos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.product_status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                products.filter((p) => p.product_status === "out-of-stock")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {products
                .reduce((sum, p) => sum + p.product_price * p.product_stock!, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventario de productos</CardTitle>
              <CardDescription>
                Administra tus productos y controla los niveles de inventario
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                        Sin imagen
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.product_description.length > 50
                          ? `${product.product_description.substring(0, 50)}...`
                          : product.product_description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.product_brand}</TableCell>
                  <TableCell>${product.product_price.toFixed(2)}</TableCell>
                  <TableCell>{product.product_stock}</TableCell>
                  <TableCell>
                    {getStatusBadge(product.product_status)}
                  </TableCell>
                  <TableCell>
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => openDetailDialog(product)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar producto
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(product)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar producto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalle del producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.product_image && (
                <img
                  src={selectedProduct.product_image}
                  alt={selectedProduct.product_name}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <div>
                <strong>Nombre:</strong> {selectedProduct.product_name}
              </div>
              <div>
                <strong>Descripción:</strong>{" "}
                {selectedProduct.product_description}
              </div>
              <div>
                <strong>Precio:</strong> $
                {selectedProduct.product_price.toFixed(2)}
              </div>
              <div>
                <strong>Categoría:</strong> {selectedProduct.product_brand}
              </div>
              <div>
                <strong>Stock:</strong> {selectedProduct.product_stock}
              </div>
              <div>
                <strong>Estado:</strong>{" "}
                {getStatusBadge(selectedProduct.product_status)}
              </div>
              <div>
                <strong>Creado:</strong>{" "}
                {selectedProduct.created_at
                  ? new Date(selectedProduct.created_at).toLocaleDateString()
                  : ""}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Realiza cambios en la información del producto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre del producto</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-isSale">¿En oferta?</Label>
              <Select
                value={formData.isSale}
                onValueChange={(value) =>
                  setFormData({ ...formData, isSale: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Falso</SelectItem>
                  <SelectItem value="true">Verdadero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priceSale">Precio en oferta ($)</Label>
              <Input
                id="edit-priceSale"
                type="number"
                step="0.01"
                value={formData.priceSale}
                onChange={(e) =>
                  setFormData({ ...formData, priceSale: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Imagen (URL)</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Marca</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "active" | "inactive" | "out-of-stock"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="out-of-stock">Sin stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditProduct}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto "{selectedProduct?.product_name}" de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
