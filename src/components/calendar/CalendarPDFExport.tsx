import { CalendarPost, Company } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CalendarPDFExportProps {
  posts: CalendarPost[];
  companies: Company[];
  currentMonth: number;
  currentYear: number;
  selectedClient?: string;
  selectedCompany?: string;
}

export function CalendarPDFExport({ 
  posts, 
  companies, 
  currentMonth, 
  currentYear,
  selectedClient,
  selectedCompany 
}: CalendarPDFExportProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const generatePDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Get company info for styling
    const companyInfo = companies.find(c => c.id === selectedCompany);
    
    let calendarHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cronograma Social Media - ${monthNames[currentMonth]} ${currentYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 16px;
          }
          .calendar {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
           .calendar th, .calendar td {
             border: 1px solid #ddd;
             padding: 8px;
             vertical-align: top;
             width: 14.28%;
             height: 160px;
           }
          .calendar th {
            background-color: #f5f5f5;
            text-align: center;
            font-weight: bold;
            height: auto;
          }
          .day-number {
            font-weight: bold;
            margin-bottom: 5px;
          }
           .post {
             color: white;
             padding: 4px 6px;
             margin: 2px 0;
             border-radius: 3px;
             font-size: 8px;
             word-wrap: break-word;
             line-height: 1.2;
           }
          .responsibility-agency {
            background: #2196F3;
          }
          .responsibility-client {
            background: #FF9800;
          }
          .legend {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
          }
          .legend h3 {
            margin-top: 0;
          }
          .legend-item {
            display: inline-block;
            margin-right: 20px;
            margin-bottom: 5px;
          }
          .legend-color {
            width: 15px;
            height: 15px;
            border-radius: 3px;
            display: inline-block;
            margin-right: 5px;
            vertical-align: middle;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cronograma de Social Media</h1>
          <p>${monthNames[currentMonth]} ${currentYear}</p>
          ${companyInfo ? `<p style="color: ${companyInfo.color};">${companyInfo.name}</p>` : ''}
        </div>
        
        <table class="calendar">
          <thead>
            <tr>
              <th>Domingo</th>
              <th>Segunda</th>
              <th>Terça</th>
              <th>Quarta</th>
              <th>Quinta</th>
              <th>Sexta</th>
              <th>Sábado</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Generate calendar grid
    let currentWeek = '<tr>';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek += '<td></td>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = posts.filter(post => post.day === day);
      
      currentWeek += `<td>
        <div class="day-number">${day}</div>`;
      
      dayPosts.forEach(post => {
        const responsibilityClass = post.responsibility === 'Agência' ? 'responsibility-agency' : 'responsibility-client';
        const networksText = post.networks.join(', ');
        currentWeek += `<div class="post ${responsibilityClass}">
          <strong>${post.subject}</strong><br>
          <small>Plataforma: ${networksText}</small><br>
          <small>Conteúdo: ${post.content || 'N/A'}</small><br>
          <small>Resp.: ${post.responsibility}</small>
        </div>`;
      });
      
      currentWeek += '</td>';
      
      // End row if it's Saturday or last day of month
      if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
        currentWeek += '</tr>';
        calendarHTML += currentWeek;
        currentWeek = '<tr>';
      }
    }
    
    // Fill remaining cells if needed
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        currentWeek += '<td></td>';
      }
      currentWeek += '</tr>';
      calendarHTML += currentWeek;
    }

    calendarHTML += `
          </tbody>
        </table>
        
        <div class="legend">
          <h3>Legenda</h3>
          <div class="legend-item">
            <span class="legend-color" style="background: #2196F3;"></span>
            Responsabilidade: Agência
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #FF9800;"></span>
            Responsabilidade: Cliente
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(calendarHTML);
    printWindow.document.close();
  };

  return (
    <Button 
      onClick={generatePDF}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Baixar PDF
    </Button>
  );
}