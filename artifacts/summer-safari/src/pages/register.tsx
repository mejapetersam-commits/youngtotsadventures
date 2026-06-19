import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRegistration, useUploadPaymentProof } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { SignaturePad } from "@/components/ui/signature-pad";

const step1Schema = z.object({
  parentName: z.string().min(2, "Name is required"),
  parentPhone: z.string().min(10, "Valid phone number required"),
  parentEmail: z.string().email("Valid email required"),
});

const step2Schema = z.object({
  childName: z.string().min(2, "Child's name is required"),
  childDateOfBirth: z.string().min(1, "Date of birth is required"),
  childAge: z.coerce.number().min(1, "Age is required"),
  homeAddress: z.string().min(5, "Address is required"),
});

const step3Schema = z.object({
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  physicalLimitations: z.string().optional(),
  specialNotes: z.string().optional(),
});

const step4Schema = z.object({
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Valid phone number required"),
  authorizedPickupPerson: z.string().min(2, "Authorized pickup person required"),
  authorizedPickupPhone: z.string().min(10, "Valid phone number required"),
});

const step5Schema = z.object({
  consentAccepted: z.boolean().refine((val) => val === true, "You must accept the consent waiver"),
  consentSignature: z.string().min(10, "Signature is required"),
  consentSignedBy: z.string().min(2, "Your printed name is required"),
  paymentProofBase64: z.string().min(10, "Payment proof is required").optional(), // Optional initially, handled custom
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema).merge(step5Schema);

type RegistrationFormValues = z.infer<typeof fullSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdRegistrationId, setCreatedRegistrationId] = useState<number | null>(null);
  
  const createRegistration = useCreateRegistration();
  const uploadPaymentProof = useUploadPaymentProof();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      childName: "",
      childDateOfBirth: "",
      childAge: 0,
      homeAddress: "",
      allergies: "",
      medicalConditions: "",
      physicalLimitations: "",
      specialNotes: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      authorizedPickupPerson: "",
      authorizedPickupPhone: "",
      consentAccepted: false,
      consentSignature: "",
      consentSignedBy: "",
      paymentProofBase64: "",
    },
  });

  const triggerValidation = async (fields: any[]) => {
    return await form.trigger(fields);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await triggerValidation(["parentName", "parentPhone", "parentEmail"]);
    } else if (step === 2) {
      isValid = await triggerValidation(["childName", "childDateOfBirth", "childAge", "homeAddress"]);
    } else if (step === 3) {
      isValid = await triggerValidation(["allergies", "medicalConditions", "physicalLimitations", "specialNotes"]);
    } else if (step === 4) {
      isValid = await triggerValidation(["emergencyContactName", "emergencyContactRelationship", "emergencyContactPhone", "authorizedPickupPerson", "authorizedPickupPhone"]);
    }
    
    if (isValid) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue("paymentProofBase64", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    try {
      const { paymentProofBase64, ...registrationData } = data;
      
      const res = await createRegistration.mutateAsync({
        data: registrationData
      });
      
      setCreatedRegistrationId(res.id);

      if (paymentProofBase64) {
        // extract mime type
        const match = paymentProofBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          
          await uploadPaymentProof.mutateAsync({
            id: res.id,
            data: {
              paymentProofBase64: base64Data,
              mimeType
            }
          });
        }
      }
      
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pt-10 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <a className="inline-flex items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-2xl font-serif font-bold text-foreground">Young Tots</span>
              </a>
            </Link>
          </div>
          
          <Card className="border-t-4 border-t-primary shadow-xl">
            <CardContent className="pt-12 pb-12 px-8 text-center flex flex-col items-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Registration Received!</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                Thank you for registering {form.getValues("childName")} for the Summer Safari 2026. We are so excited to have them join us!
              </p>
              
              <div className="bg-amber-50 p-6 rounded-lg text-left w-full max-w-md mb-8">
                <h3 className="font-bold text-amber-900 mb-2 border-b border-amber-200 pb-2">Next Steps</h3>
                <ul className="space-y-3 text-amber-800">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>We will review your registration and payment details.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>You will receive a confirmation email within 24 hours.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>A packing list will be sent closer to the start date.</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-10 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="text-2xl font-serif font-bold text-foreground">Young Tots</span>
            </a>
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step {step} of 5</span>
            <span className="text-sm font-medium text-primary">
              {step === 1 && "Parent/Guardian"}
              {step === 2 && "Child Details"}
              {step === 3 && "Medical Info"}
              {step === 4 && "Emergency Contacts"}
              {step === 5 && "Consent & Payment"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card className="shadow-lg border-muted">
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Parent Info */}
                <div className={step === 1 ? "block" : "hidden"}>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Parent/Guardian Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="0700 000 000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Step 2: Child Info */}
                <div className={step === 2 ? "block" : "hidden"}>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Child Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="childName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Full Name</FormLabel>
                          <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="childDateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="childAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl><Input type="number" min="0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="homeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Address (Estate/Area)</FormLabel>
                          <FormControl><Textarea placeholder="e.g., Lavington, Nairobi" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Step 3: Medical */}
                <div className={step === 3 ? "block" : "hidden"}>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Medical Information <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies (Food, medicine, etc.)</FormLabel>
                          <FormControl><Textarea placeholder="None" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing Medical Conditions</FormLabel>
                          <FormControl><Textarea placeholder="None" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="physicalLimitations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Limitations</FormLabel>
                          <FormControl><Textarea placeholder="None" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Special Notes</FormLabel>
                          <FormControl><Textarea placeholder="Any other information we should know" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Step 4: Emergency Contacts */}
                <div className={step === 4 ? "block" : "hidden"}>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Emergency Contacts & Pickup</h2>
                  <div className="space-y-6">
                    <div className="bg-secondary/10 p-4 rounded-lg space-y-4">
                      <h3 className="font-bold text-secondary">Primary Emergency Contact</h3>
                      <p className="text-sm text-muted-foreground mb-4">Someone other than the registering parent if possible.</p>
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContactRelationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl><Input placeholder="Aunt, Uncle, etc." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl><Input placeholder="0700 000 000" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="bg-accent/10 p-4 rounded-lg space-y-4">
                      <h3 className="font-bold text-accent-foreground">Authorized Pickup Person</h3>
                      <p className="text-sm text-muted-foreground mb-4">Who is authorized to pick up the child at 3:00 PM?</p>
                      <FormField
                        control={form.control}
                        name="authorizedPickupPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="authorizedPickupPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input placeholder="0700 000 000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 5: Consent & Payment */}
                <div className={step === 5 ? "block" : "hidden"}>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Consent & Payment</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg border border-border text-sm text-muted-foreground h-40 overflow-y-auto">
                      <p className="mb-2 font-bold text-foreground">Parental Consent & Liability Waiver</p>
                      <p className="mb-2">I give permission for my child to attend the Young Tots Edventures Summer Safari 2026 and participate in all activities. I understand that the organizers will take all necessary precautions to ensure the safety of the children, but will not be held liable for any accidents, injuries, or loss of property that may occur during the program.</p>
                      <p className="mb-2">I authorize the organizers to seek emergency medical treatment for my child if necessary, and agree to cover any resulting medical expenses.</p>
                      <p>I consent to my child being photographed or video recorded during the program for promotional purposes.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="consentAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the Parental Consent & Liability Waiver
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Digital Signature</FormLabel>
                          <FormControl>
                            <SignaturePad onSignatureChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentSignedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Printed Name</FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6">
                      <h3 className="font-bold text-lg mb-4">Payment Instructions</h3>
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                        <p className="font-bold text-amber-900 mb-2">Total Amount: KSh 21,500</p>
                        <p className="text-amber-800 text-sm mb-4">Please send the payment via M-Pesa to either of the following numbers:</p>
                        <ul className="text-amber-900 font-medium space-y-2 bg-white p-3 rounded border border-amber-100">
                          <li>Judie Wambua: <span className="text-primary text-lg ml-2">0720 764 275</span></li>
                          <li>Celestine Sabuti: <span className="text-primary text-lg ml-2">0724 810 846</span></li>
                        </ul>
                      </div>
                      
                      <FormItem>
                        <FormLabel>Upload M-Pesa Payment Screenshot (Optional but recommended)</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" onChange={handleFileUpload} />
                        </FormControl>
                        {form.formState.errors.paymentProofBase64 && (
                          <p className="text-sm font-medium text-destructive">{form.formState.errors.paymentProofBase64.message}</p>
                        )}
                      </FormItem>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < 5 ? (
                    <Button type="button" onClick={nextStep} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={createRegistration.isPending || uploadPaymentProof.isPending} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]">
                      {createRegistration.isPending || uploadPaymentProof.isPending ? "Submitting..." : "Complete Registration"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
