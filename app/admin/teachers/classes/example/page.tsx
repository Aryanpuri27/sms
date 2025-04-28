"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Simple example page to demonstrate checkbox usage
export default function CheckboxExample() {
  // Sample class data
  const sampleClasses = [
    { id: "class1", name: "Mathematics", isAssigned: false },
    { id: "class2", name: "Physics", isAssigned: true },
    { id: "class3", name: "Chemistry", isAssigned: false },
    { id: "class4", name: "Biology", isAssigned: true },
    { id: "class5", name: "Computer Science", isAssigned: false },
  ];

  // State for tracking selected classes
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set(sampleClasses.filter((c) => c.isAssigned).map((c) => c.id))
  );

  // Function to handle checkbox toggle
  const handleToggle = (classId: string) => {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  // Function to save changes (simulated)
  const saveChanges = () => {
    console.log("Selected class IDs:", Array.from(selectedClasses));
    alert(`Changes saved! Selected ${selectedClasses.size} classes.`);
  };

  return (
    <div className="container mx-auto py-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Checkbox Example</CardTitle>
          <CardDescription>
            This demonstrates the proper way to use checkboxes for selecting
            multiple items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Classes</h3>
            <div className="grid gap-4">
              {sampleClasses.map((cls) => (
                <div key={cls.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cls.id}
                    checked={selectedClasses.has(cls.id)}
                    onCheckedChange={() => handleToggle(cls.id)}
                  />
                  <Label htmlFor={cls.id} className="cursor-pointer">
                    {cls.name} {cls.isAssigned && "(Initially Assigned)"}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedClasses.size} classes selected
          </div>
          <Button onClick={saveChanges}>Save Changes</Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Implementation Notes:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use a <code>Set</code> to track selected items efficiently
          </li>
          <li>
            Set the <code>checked</code> prop based on whether the id exists in
            the Set
          </li>
          <li>
            Use the <code>onCheckedChange</code> event for handling changes
          </li>
          <li>
            Make sure to use a proper label with a matching htmlFor attribute
          </li>
          <li>
            Maintain original selection state when initializing the component
          </li>
        </ul>
      </div>
    </div>
  );
}
