
// This component is no longer used in the dashboard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface RequirementItem {
  id: string
  text: string
}

interface RequirementCategory {
  title: string
  items: RequirementItem[]
}

interface AdmissionRequirementsProps {
  categories: RequirementCategory[]
}

const AdmissionRequirements: React.FC<AdmissionRequirementsProps> = ({
  categories,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admission Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => (
          <div key={category.title} className="space-y-2">
            <h3 className="text-lg font-medium">{category.title}</h3>
            <ul className="space-y-2">
              {category.items.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default AdmissionRequirements
