"use client";

import { DialogTrigger } from "@/components/ui/dialog";

import { useState } from "react";
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

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  orderDate: string;
  notes?: string;
}

// Add this new interface for product selection
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// Add these mock products (in a real app, you'd fetch these from your products API)
const availableProducts: Product[] = [
  { id: "1", name: "Auriculares inalámbricos", price: 199.99, stock: 45 },
  { id: "2", name: "Reloj inteligente", price: 299.99, stock: 23 },
  { id: "3", name: "Cafetera", price: 89.99, stock: 15 },
  { id: "4", name: "Esterilla de yoga", price: 29.99, stock: 67 },
  { id: "5", name: "Lámpara de escritorio", price: 49.99, stock: 12 },
];

const initialOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "Juan Pérez",
    customerEmail: "juan.perez@email.com",
    items: [
      {
        id: "1",
        productName: "Auriculares inalámbricos",
        quantity: 1,
        price: 199.99,
      },
      { id: "2", productName: "Reloj inteligente", quantity: 1, price: 299.99 },
    ],
    totalAmount: 499.98,
    status: "processing",
    shippingAddress: "Calle Principal 123, Ciudad de México, CDMX 01000",
    orderDate: "2024-01-15",
    notes: "El cliente solicitó envío exprés",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Sara Gómez",
    customerEmail: "sara.g@email.com",
    items: [
      { id: "3", productName: "Esterilla de yoga", quantity: 2, price: 29.99 },
    ],
    totalAmount: 59.98,
    status: "shipped",
    shippingAddress: "Av. Roble 456, Monterrey, NL 64000",
    orderDate: "2024-01-14",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "Miguel Díaz",
    customerEmail: "miguel.diaz@email.com",
    items: [
      { id: "4", productName: "Cafetera", quantity: 1, price: 89.99 },
      {
        id: "5",
        productName: "Lámpara de escritorio",
        quantity: 1,
        price: 49.99,
      },
    ],
    totalAmount: 139.98,
    status: "delivered",
    shippingAddress: "Calle Pino 789, Guadalajara, JAL 44100",
    orderDate: "2024-01-12",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customerName: "Emilia Wilson",
    customerEmail: "emilia.w@email.com",
    items: [
      { id: "6", productName: "Reloj inteligente", quantity: 1, price: 299.99 },
    ],
    totalAmount: 299.99,
    status: "pending",
    shippingAddress: "Calle Olmo 321, Mérida, YUC 97000",
    orderDate: "2024-01-16",
    notes: "Solicitó envoltura para regalo",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customerName: "Roberto Moreno",
    customerEmail: "roberto.moreno@email.com",
    items: [
      {
        id: "7",
        productName: "Auriculares inalámbricos",
        quantity: 2,
        price: 199.99,
      },
    ],
    totalAmount: 399.98,
    status: "cancelled",
    shippingAddress: "Av. Maple 654, Monterrey, NL 64000",
    orderDate: "2024-01-10",
    notes: "El cliente solicitó cancelación por cambio de opinión",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    totalAmount: "",
    status: "pending" as const,
    shippingAddress: "",
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addOrderItem = () => {
    if (!selectedProductId) return;

    const product = availableProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productName === product.name,
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productName: product.name,
        quantity: selectedQuantity,
        price: product.price,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProductId("");
    setSelectedQuantity(1);
    updateTotalAmount([...orderItems]);
  };

  const removeOrderItem = (itemId: string) => {
    const updatedItems = orderItems.filter((item) => item.id !== itemId);
    setOrderItems(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const updateTotalAmount = (items: OrderItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setFormData({ ...formData, totalAmount: total.toString() });
  };

  const handleAddOrder = () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      items: orderItems, // Use the selected items
      totalAmount: Number.parseFloat(formData.totalAmount),
      status: formData.status,
      shippingAddress: formData.shippingAddress,
      orderDate: new Date().toISOString().split("T")[0],
      notes: formData.notes,
    };
    setOrders([...orders, newOrder]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            totalAmount: Number.parseFloat(formData.totalAmount),
            status: formData.status,
            shippingAddress: formData.shippingAddress,
            notes: formData.notes,
          }
        : order,
    );
    setOrders(updatedOrders);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteOrder = () => {
    if (!selectedOrder) return;

    setOrders(orders.filter((order) => order.id !== selectedOrder.id));
    setIsDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setOrderItems(order.items);
    setFormData({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      shippingAddress: order.shippingAddress,
      notes: order.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (order: Order) => {
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
      notes: "",
    });
    setOrderItems([]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-yellow-100 text-yellow-800">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.totalAmount, 0);
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
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
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
                              {item.productName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {item.quantity}x ${item.price.toFixed(2)} = $
                              {(item.quantity * item.price).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderItem(item.id)}
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
              {orders.filter((o) => o.status === "pending").length}
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
              {orders.filter((o) => o.status === "delivered").length}
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
              ${getTotalRevenue().toFixed(2)}
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
                    <div className="font-medium">{order.orderNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.length > 0 ? (
                        <>
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id}>
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-muted-foreground">
                              +{order.items.length - 2} más
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
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
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
              Información completa para {selectedOrder?.orderNumber}
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
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOrder.customerEmail}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Información de la orden
                  </Label>
                  <div className="mt-1 space-y-1">
                    <div># Orden: {selectedOrder.orderNumber}</div>
                    <div>Fecha: {selectedOrder.orderDate}</div>
                    <div>Estado: {getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Dirección de envío
                </Label>
                <div className="mt-1 text-sm">
                  {selectedOrder.shippingAddress}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Productos</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{item.productName}</span>
                        </div>
                        <div className="text-sm">
                          {item.quantity}x ${item.price.toFixed(2)} = $
                          {(item.quantity * item.price).toFixed(2)}
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
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              {selectedOrder.notes && (
                <div>
                  <Label className="text-sm font-medium">Notas</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedOrder.notes}
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
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)}
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
                            {item.productName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.quantity}x ${item.price.toFixed(2)} = $
                            {(item.quantity * item.price).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(item.id)}
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
              la orden "{selectedOrder?.orderNumber}" y todos sus datos
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
