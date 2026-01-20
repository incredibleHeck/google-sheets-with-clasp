/**
 * HeckTeck Document Generator
 * Generates individual report cards from the EOT Report sheet.
 * Includes error handling, validation, and progress tracking.
 */

function generateReportCards() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // 1. Validate Setup
    const config = validateAndGetConfig(ss, ui);
    if (!config) return;

    // 2. Get Data
    const { data, headers, studentRows } = getReportData(config.sheet);
    if (studentRows.length === 0) {
      ui.alert("⚠️ No student records found in sheet.", ui.ButtonSet.OK);
      return;
    }

    // 3. Generate Reports with Progress Tracking
    const results = generateReportsWithProgress(ss, ui, config, headers, studentRows);

    // 4. Display Results
    displayResults(ui, results);

  } catch (error) {
    console.error("Report generation error:", error);
    ui.alert(`❌ Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

// ==========================================
// CONFIGURATION & VALIDATION
// ==========================================

/**
 * Validates configuration and prompts user for IDs if needed
 */
function validateAndGetConfig(ss, ui) {
  let userProps = PropertiesService.getUserProperties();
  let templateId = userProps.getProperty('RPT_TEMPLATE_ID');
  let folderId = userProps.getProperty('RPT_FOLDER_ID');
  let sheetName = userProps.getProperty('RPT_SHEET_NAME') || "PRIMARY EOT 1 REPORT";

  // Prompt for missing IDs
  if (!templateId || !folderId) {
    const response = ui.prompt(
      "Setup Required",
      "Enter Template ID and Folder ID (comma-separated):",
      ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() === ui.Button.CANCEL) return null;

    const [tId, fId] = response.getResponseText().split(',').map(s => s.trim());
    if (!tId || !fId) {
      ui.alert("❌ Both IDs are required.", ui.ButtonSet.OK);
      return null;
    }

    templateId = tId;
    folderId = fId;

    // Save for future use
    userProps.setProperty('RPT_TEMPLATE_ID', templateId);
    userProps.setProperty('RPT_FOLDER_ID', folderId);
  }

  // Validate IDs against Drive
  try {
    const templateFile = DriveApp.getFileById(templateId);
    const destinationFolder = DriveApp.getFolderById(folderId);

    // Validate sheet
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      ui.alert(`⚠️ Sheet "${sheetName}" not found. Using first sheet.`, ui.ButtonSet.OK);
      const firstSheet = ss.getSheets()[0];
      return {
        templateFile,
        destinationFolder,
        sheet: firstSheet,
        sheetName: firstSheet.getName()
      };
    }

    return { templateFile, destinationFolder, sheet, sheetName };

  } catch (error) {
    ui.alert(`❌ Invalid IDs or missing template/folder.\n\nError: ${error.message}`, ui.ButtonSet.OK);
    return null;
  }
}

// ==========================================
// DATA PROCESSING
// ==========================================

/**
 * Extracts data from sheet with validation
 */
function getReportData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const studentRows = data.slice(1).filter(row => row[1] && row[1] !== "#REF!");

  return { data, headers, studentRows };
}

/**
 * Generates reports with progress tracking
 */
function generateReportsWithProgress(ss, ui, config, headers, studentRows) {
  const results = {
    success: [],
    failed: [],
    skipped: 0
  };

  const totalRows = studentRows.length;

  studentRows.forEach((row, index) => {
    const studentName = row[1];

    // Show progress in the Spreadsheet UI
    const progressPercent = Math.round(((index + 1) / totalRows) * 100);
    ss.toast(`[${progressPercent}%] Processing ${studentName}...`, "Generating Reports");

    try {
      // Create document copy
      const docName = `${studentName} - Term 1 Report`;
      const copy = config.templateFile.makeCopy(docName, config.destinationFolder);
      const doc = DocumentApp.openById(copy.getId());
      const body = doc.getBody();

      // Replace placeholders: maps header name to <<HeaderName>>
      headers.forEach((header, colIndex) => {
        if (header && header.toString().trim()) {
          const value = row[colIndex] ? row[colIndex].toString() : "";
          const placeholder = `<<${header}>>`;
          body.replaceText(placeholder, value);
        }
      });

      doc.saveAndClose();
      results.success.push({ name: studentName, docId: copy.getId(), docName });

    } catch (error) {
      console.error(`Failed for ${studentName}:`, error);
      results.failed.push({ name: studentName, error: error.message });
    }
  });

  return results;
}

// ==========================================
// UI & MAINTENANCE
// ==========================================

/**
 * Displays final results with summary
 */
function displayResults(ui, results) {
  const successCount = results.success.length;
  const failedCount = results.failed.length;
  const totalCount = successCount + failedCount;

  let message = `🎉 Report Generation Complete!\n\n`;
  message += `✅ Success: ${successCount}/${totalCount}\n`;

  if (failedCount > 0) {
    message += `❌ Failed: ${failedCount}\n`;
    message += `\nFailed students:\n`;
    results.failed.slice(0, 5).forEach(item => {
      message += `• ${item.name}\n`;
    });
    if (failedCount > 5) {
      message += `• ... and ${failedCount - 5} more\n`;
    }
  }

  ui.alert(message, ui.ButtonSet.OK);
}

/**
 * Clears saved configuration (for resetting IDs)
 */
function clearReportConfig() {
  const props = PropertiesService.getUserProperties();
  props.deleteProperty('RPT_TEMPLATE_ID');
  props.deleteProperty('RPT_FOLDER_ID');
  SpreadsheetApp.getUi().alert("Configuration cleared. Next run will prompt for IDs.", SpreadsheetApp.getUi().ButtonSet.OK);
}