
import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building,
  CreditCard,
  Edit,
  Save,
  Settings as SettingsIcon,
  Shield,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

const FinancialSettingsPage = () => {
  useAuthGuard(['financial']);
  
  // State for form values
  const [generalSettings, setGeneralSettings] = useState({
    universityName: 'University of Knowledge',
    fiscalYear: '2023-2024',
    currencyFormat: 'USD',
    taxId: '12-3456789',
    address: '123 University Ave, Academic City, ST 12345',
    email: 'finance@university.edu',
    phone: '(555) 123-4567',
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCreditCards: true,
    acceptBankTransfers: true,
    acceptCash: false,
    acceptChecks: true,
    lateFeePercentage: 5,
    gracePeriodDays: 14,
    paymentReminderDays: [3, 7, 14],
    overdueReminderDays: [1, 7, 14, 30],
  });
  
  const [processingEnabled, setProcessingEnabled] = useState({
    stripe: true,
    paypal: false,
    bankTransfer: true,
  });
  
  // Handlers
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSaveGeneralSettings = () => {
    // In a real app, this would send the data to your API
    toast.success('General settings saved successfully');
  };
  
  const handleSavePaymentSettings = () => {
    // In a real app, this would send the data to your API
    toast.success('Payment settings saved successfully');
  };
  
  const handleSaveApiIntegrations = () => {
    // In a real app, this would send the data to your API
    toast.success('API Integrations saved successfully');
  };
  
  const handlePaymentProcessorToggle = (processor: keyof typeof processingEnabled) => {
    setProcessingEnabled({
      ...processingEnabled,
      [processor]: !processingEnabled[processor],
    });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Settings" 
        description="Configure system-wide financial settings and preferences"
        action={{
          label: "Save All Settings",
          icon: Save,
          onClick: () => toast.success('All settings saved successfully'),
        }}
      />
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Shield className="mr-2 h-4 w-4" />
            API Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>University Information</CardTitle>
              <CardDescription>
                Basic information about your institution used in financial documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="universityName">University Name</Label>
                  <Input
                    id="universityName"
                    name="universityName"
                    value={generalSettings.universityName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Current Fiscal Year</Label>
                  <Input
                    id="fiscalYear"
                    name="fiscalYear"
                    value={generalSettings.fiscalYear}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyFormat">Currency Format</Label>
                  <Select 
                    value={generalSettings.currencyFormat}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, currencyFormat: value})}
                  >
                    <SelectTrigger id="currencyFormat">
                      <SelectValue placeholder="Select currency format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={generalSettings.taxId}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={generalSettings.address}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Financial Office Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Financial Office Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={generalSettings.phone}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveGeneralSettings}>
                Save General Settings
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Document Customization</CardTitle>
              <CardDescription>
                Customize financial documents and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    defaultValue="INV-"
                    placeholder="e.g., INV-"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptPrefix">Receipt Number Prefix</Label>
                  <Input
                    id="receiptPrefix"
                    defaultValue="RCPT-"
                    placeholder="e.g., RCPT-"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                  <Textarea
                    id="invoiceFooter"
                    defaultValue="Thank you for your business. Please contact the financial office with any questions."
                    rows={3}
                    placeholder="Enter text to appear at the bottom of invoices"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="mr-2">
                Preview Documents
              </Button>
              <Button>
                Save Document Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure which payment methods are accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="acceptCreditCards" className="mb-1">Accept Credit Cards</Label>
                    <span className="text-sm text-muted-foreground">Allow payments via credit/debit cards</span>
                  </div>
                  <Switch
                    id="acceptCreditCards"
                    checked={paymentSettings.acceptCreditCards}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptCreditCards: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="acceptBankTransfers" className="mb-1">Accept Bank Transfers</Label>
                    <span className="text-sm text-muted-foreground">Allow payments via direct bank transfers</span>
                  </div>
                  <Switch
                    id="acceptBankTransfers"
                    checked={paymentSettings.acceptBankTransfers}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptBankTransfers: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="acceptCash" className="mb-1">Accept Cash</Label>
                    <span className="text-sm text-muted-foreground">Allow in-person cash payments</span>
                  </div>
                  <Switch
                    id="acceptCash"
                    checked={paymentSettings.acceptCash}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptCash: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="acceptChecks" className="mb-1">Accept Checks</Label>
                    <span className="text-sm text-muted-foreground">Allow payments via personal or bank checks</span>
                  </div>
                  <Switch
                    id="acceptChecks"
                    checked={paymentSettings.acceptChecks}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptChecks: checked})}
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Late Payment Settings</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lateFeePercentage">Late Fee Percentage</Label>
                    <div className="flex items-center">
                      <Input
                        id="lateFeePercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={paymentSettings.lateFeePercentage}
                        onChange={(e) => setPaymentSettings({...paymentSettings, lateFeePercentage: parseFloat(e.target.value)})}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gracePeriodDays">Grace Period (Days)</Label>
                    <Input
                      id="gracePeriodDays"
                      type="number"
                      min="0"
                      value={paymentSettings.gracePeriodDays}
                      onChange={(e) => setPaymentSettings({...paymentSettings, gracePeriodDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Reminder Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentReminderDays">Payment Reminder Days (Before Due Date)</Label>
                  <div className="flex flex-wrap gap-2">
                    {paymentSettings.paymentReminderDays.map((days, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {days} {days === 1 ? 'day' : 'days'}
                        <button className="ml-2 text-muted-foreground hover:text-foreground">×</button>
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm">Add</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="overdueReminderDays">Overdue Reminder Days (After Due Date)</Label>
                  <div className="flex flex-wrap gap-2">
                    {paymentSettings.overdueReminderDays.map((days, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {days} {days === 1 ? 'day' : 'days'}
                        <button className="ml-2 text-muted-foreground hover:text-foreground">×</button>
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm">Add</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSavePaymentSettings}>
                Save Payment Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processors</CardTitle>
              <CardDescription>
                Configure payment processing integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Stripe</h3>
                        <p className="text-sm text-muted-foreground">Credit card processing via Stripe</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={processingEnabled.stripe ? "success" : "outline"}>
                        {processingEnabled.stripe ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={processingEnabled.stripe}
                        onCheckedChange={() => handlePaymentProcessorToggle('stripe')}
                      />
                    </div>
                  </div>
                  
                  {processingEnabled.stripe && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                          <Input
                            id="stripePublicKey"
                            defaultValue="pk_test_******************************"
                            type="password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                          <Input
                            id="stripeSecretKey"
                            defaultValue="sk_test_******************************"
                            type="password"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="stripeWebhook">Webhook URL</Label>
                          <div className="flex">
                            <Input
                              id="stripeWebhook"
                              value="https://universitymanagement.com/api/v1/webhooks/stripe"
                              readOnly
                              className="rounded-r-none"
                            />
                            <Button variant="secondary" className="rounded-l-none">
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-blue-500/10 p-2">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">PayPal</h3>
                        <p className="text-sm text-muted-foreground">Process payments through PayPal</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={processingEnabled.paypal ? "success" : "outline"}>
                        {processingEnabled.paypal ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={processingEnabled.paypal}
                        onCheckedChange={() => handlePaymentProcessorToggle('paypal')}
                      />
                    </div>
                  </div>
                  
                  {processingEnabled.paypal && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                          <Input
                            id="paypalClientId"
                            placeholder="Enter your PayPal client ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paypalSecret">PayPal Secret</Label>
                          <Input
                            id="paypalSecret"
                            placeholder="Enter your PayPal secret"
                            type="password"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-emerald-500/10 p-2">
                        <Building className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Bank Transfer</h3>
                        <p className="text-sm text-muted-foreground">Configure direct bank transfer details</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={processingEnabled.bankTransfer ? "success" : "outline"}>
                        {processingEnabled.bankTransfer ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={processingEnabled.bankTransfer}
                        onCheckedChange={() => handlePaymentProcessorToggle('bankTransfer')}
                      />
                    </div>
                  </div>
                  
                  {processingEnabled.bankTransfer && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            defaultValue="First National Bank"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountName">Account Name</Label>
                          <Input
                            id="accountName"
                            defaultValue="University of Knowledge"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            defaultValue="****3456"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            defaultValue="*****7890"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bankInstructions">Payment Instructions</Label>
                          <Textarea
                            id="bankInstructions"
                            defaultValue="Please include student ID and name in the transfer reference."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                Test Connections
              </Button>
              <Button onClick={handleSaveApiIntegrations}>
                Save API Integrations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialSettingsPage;
