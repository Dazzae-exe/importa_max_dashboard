import { DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  User,
  Package,
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
import {
  getOrders,
  getProducts,
  addOrders,
  updateOrder,
  deleteOrder,
} from "@/lib/supabase/utils";
import type { OrderProduct, Orders } from "@/lib/types/OrderTypes";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Orders[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);
  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail: string;
    totalAmount: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    shippingAddress: string;
    shippingMethod: string;
    notes: string;
    orderBy: string;
  }>({
    customerName: "",
    customerEmail: "",
    totalAmount: "",
    status: "pending",
    shippingAddress: "",
    shippingMethod: "",
    notes: "",
    orderBy: ""
  });

  const [orderItems, setOrderItems] = useState<OrderProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [availableProducts, setAvailableProducts] = useState<OrderProduct[]>([]);

  const ordersData = getOrders();
  const productData = getProducts();

  useEffect(() => {
    const fetchData = async () => {
      const data = await ordersData;
      const products = await productData;
      console.log(data);
      setOrders(data);
      setAvailableProducts(products);
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.order_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_for.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addOrderItem = async () => {
    if (!selectedProductId) return;

    const product = availableProducts.find(
      (p) => String(p.id) === selectedProductId
    );
    if (!product) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.product_name === product.product_name
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].product_quantity += selectedQuantity;
      setOrderItems(updatedItems);
      updateTotalAmount(updatedItems);
    } else {
      const newItem: OrderProduct = {
        id: product.id,
        product_name: product.product_name,
        product_quantity: selectedQuantity,
        product_price: product.product_price,
      };
      const newOrderItems = [...orderItems, newItem];
      setOrderItems(newOrderItems);
      updateTotalAmount(newOrderItems);
    }

    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const removeOrderItem = (itemId: number) => {
    const updatedItems = orderItems.filter((item) => item.id !== itemId);
    setOrderItems(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const updateTotalAmount = (items: OrderProduct[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.product_price * item.product_quantity,
      0,
    );
    setFormData({ ...formData, totalAmount: total.toString() });
  };

  // Cambia handleAddOrder para usar Supabase
  const handleAddOrder = async () => {
    const newOrder: Orders = {
      order_ref: `ORD-2025-${String(orders.length + 1).padStart(3, "0")}`,
      order_for: formData.customerName,
      order_customerEmail: formData.customerEmail,
      order_products: orderItems,
      order_totalPrice: Number.parseFloat(formData.totalAmount),
      order_status: formData.status,
      order_address: formData.shippingAddress,
      order_shippingDate: new Date().toISOString().split("T")[0],
      order_shippingMethod: formData.shippingAddress,
      order_notes: formData.notes,
      order_by: formData.orderBy,
    };
    try {
      await addOrders(newOrder);
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  // Cambia handleEditOrder para usar Supabase
  const handleEditOrder = async () => {
    if (!selectedOrder) return;
    try {
      const updates: Partial<Orders> = {
        order_for: formData.customerName,
        order_customerEmail: formData.customerEmail,
        order_products: orderItems,
        order_totalPrice: Number.parseFloat(formData.totalAmount),
        order_status: formData.status,
        order_address: formData.shippingAddress,
        order_shippingMethod: formData.shippingAddress,
        order_notes: formData.notes,
        order_by: formData.orderBy,
      };
      await updateOrder(selectedOrder.id! as number, updates);
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Cambia handleDeleteOrder para usar Supabase
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id! as number);
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const openEditDialog = (order: Orders) => {
    setSelectedOrder(order);
    setOrderItems(order.order_products);
    setFormData({
      customerName: order.order_for,
      customerEmail: order.order_customerEmail,
      totalAmount: order.order_totalPrice.toString(),
      status: order.order_status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
      shippingAddress: order.order_address,
      shippingMethod: order.order_shippingMethod || "",
      notes: order.order_notes || "",
      orderBy: order.order_by || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (order: Orders) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (order: Orders) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      totalAmount: "",
      status: "pending",
      shippingAddress: "",
      shippingMethod: "",
      notes: "",
      orderBy: ""
    });
    setOrderItems([]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: Orders["order_status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">En proceso</Badge>;
      case "shipped":
        return <Badge className="bg-yellow-100 text-yellow-800">Enviado</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Entregado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter((order) => order.order_status !== "cancelled")
      .reduce((sum, order) => sum + order.order_totalPrice, 0);
  };

  return (
    <div className="space-y-6 p-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-muted-foreground">
            Administra las órdenes de clientes y el seguimiento de envíos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar orden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar nueva orden</DialogTitle>
              <DialogDescription>
                Crea una nueva orden para un cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Nombre del cliente</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Introduce el nombre del cliente"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerEmail">Correo electrónico</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shippingAddress">Dirección de envío</Label>
                <Textarea
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: e.target.value,
                    })
                  }
                  placeholder="Introduce la dirección de envío"
                />
              </div>
              {/* Selección de productos */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Productos de la orden
                </Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="text-sm font-medium">
                    Agregar producto
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={selectedProductId}
                      onValueChange={setSelectedProductId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={String(product.id ?? "")}>
                            {product.product_name} - ${product.product_price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) =>
                        setSelectedQuantity(
                          Number.parseInt(e.target.value) || 1,
                        )
                      }
                      placeholder="Cant."
                    />
                    <Button
                      onClick={addOrderItem}
                      disabled={!selectedProductId}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
                {/* Lista de productos seleccionados */}
                {orderItems.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <Label className="text-sm font-medium mb-3 block">
                      Productos seleccionados
                    </Label>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {item.product_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {item.product_quantity}x ${item.product_price.toFixed(2)} = $
                              {(item.product_quantity * item.product_price).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderItem(item.id as number)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">Total ($)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="0.00"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value:
                        | "pending"
                        | "processing"
                        | "shipped"
                        | "delivered"
                        | "cancelled",
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Agrega notas o instrucciones especiales"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddOrder}
                disabled={orderItems.length === 0}
              >
                Agregar orden
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
              Órdenes totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes pendientes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.order_status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes entregadas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.order_status === "delivered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getTotalRevenue()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de órdenes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de órdenes</CardTitle>
              <CardDescription>
                Controla y administra las órdenes de los clientes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar órdenes..."
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
                <TableHead># Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.order_ref}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.order_for}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.order_products.length > 0 ? (
                        <>
                          {order.order_products.slice(0, 2).map((item) => (
                            <div key={item.id}>
                              {item.product_quantity}x {item.product_name}
                            </div>
                          ))}
                          {order.order_products.length > 2 && (
                            <div className="text-muted-foreground">
                              +{order.order_products.length - 2} más
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Sin productos
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${order.order_totalPrice}</TableCell>
                  <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                  <TableCell>
                    {order.created_at
                      ? order.created_at instanceof Date
                        ? order.created_at.toLocaleDateString()
                        : order.created_at
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
                        <DropdownMenuItem onClick={() => openViewDialog(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar orden
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(order)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar orden
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

      {/* Diálogo para ver orden */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la orden</DialogTitle>
            <DialogDescription>
              Información completa para {selectedOrder?.order_ref}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Información del cliente
                  </Label>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.order_for}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOrder.order_customerEmail}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Información de la orden
                  </Label>
                  <div className="mt-1 space-y-1">
                    <div># Orden: {selectedOrder.order_ref}</div>
                    {/* Ignore eslint */}
                    <div>
                      Fecha: {selectedOrder?.created_at
                        ? (selectedOrder.created_at instanceof Date
                            ? selectedOrder.created_at.toLocaleDateString()
                            : typeof selectedOrder.created_at === "string"
                              ? selectedOrder.created_at
                              : "")
                        : ""}
                    </div>
                    
                    <div>Estado: {getStatusBadge(selectedOrder.order_status)}</div>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Dirección de envío
                </Label>
                <div className="mt-1 text-sm">
                  {selectedOrder.order_address}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Productos</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.order_products.length > 0 ? (
                    selectedOrder.order_products.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{item.product_name}</span>
                        </div>
                        <div className="text-sm">
                          {item.product_quantity}x ${item.product_price} = $
                          {(item.product_quantity * item.product_price)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Sin productos en esta orden
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">
                  ${selectedOrder.order_totalPrice}
                </span>
              </div>
              {selectedOrder.order_notes && (
                <div>
                  <Label className="text-sm font-medium">Notas</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedOrder.order_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar orden</DialogTitle>
            <DialogDescription>
              Realiza cambios en la información de la orden.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Nombre del cliente</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Introduce el nombre del cliente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerEmail">Correo electrónico</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shippingAddress">Dirección de envío</Label>
              <Textarea
                id="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                placeholder="Introduce la dirección de envío"
              />
            </div>

            {/* Selección de productos */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Productos de la orden
              </Label>
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Agregar producto</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={String(product.id ?? "")}>
                          {product.product_name} - ${product.product_price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(Number.parseInt(e.target.value) || 1)
                    }
                    placeholder="Cant."
                  />
                  <Button onClick={addOrderItem} disabled={!selectedProductId}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
              {/* Lista de productos seleccionados */}
              {orderItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium mb-3 block">
                    Productos seleccionados
                  </Label>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {item.product_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.product_quantity}x ${item.product_price.toFixed(2)} = $
                            {(item.product_quantity * item.product_price).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(item.id as number)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total ($)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  placeholder="0.00"
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value:
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled",
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Agrega notas o instrucciones especiales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditOrder}>
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
              la orden "{selectedOrder?.order_ref}" y todos sus datos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
