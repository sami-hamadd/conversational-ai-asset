import React from 'react';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

interface MarkdownTableProps {
    markdown: string;
}
function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

const MarkdownTable: React.FC<MarkdownTableProps> = ({ markdown }) => {
    const lines = markdown.trim().split('\n');
    const headers = lines[0].split('|').filter((header) => header.trim() !== '');
    const rowsData = lines
        .slice(2)
        .map((line, rowIndex) => {
            const cells = line.split('|').filter((cell) => cell.trim() !== '');
            return { id: rowIndex, ...Object.fromEntries(headers.map((header, i) => [header.trim(), cells[i]?.trim() || ''])) };
        });

    // Define columns for DataGrid using headers from markdown
    const columns: GridColDef[] = headers.map((header) => ({
        field: header.trim(),
        headerName: header.trim(),
        flex: 1,
        minWidth: 100,
    }));

    return (
        <Paper
            sx={{
                height: 400,
                width: '100%',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                marginTop: '1.5rem',
                border: '1px solid black',
            }}
        >
            <DataGrid
                rows={rowsData}
                columns={columns}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
                }}
                sx={{
                    scrollbarWidth: 'thin',
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'lightgrey', // Adjust to match theme if needed
                    },
                }}
                slots={{ toolbar: CustomToolbar }}
            />
        </Paper>
    );
};

export default MarkdownTable;
