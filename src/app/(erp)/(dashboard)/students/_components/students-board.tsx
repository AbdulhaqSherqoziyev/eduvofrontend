'use client';

import { useEffect, useState } from 'react';
import { StudentsToolbar } from './students-toolbar';
import { StudentTable } from './student-table';
import { DeletedStudentTable } from './deleted-student-table';

/** Owns the students screen state (search / filter / trash) and composes the views. */
export function StudentsBoard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [trashed, setTrashed] = useState(false);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    if (status) setFilter(status);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <StudentsToolbar
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        trashed={trashed}
        onToggleTrash={() => setTrashed((t) => !t)}
      />
      {trashed ? <DeletedStudentTable search={search} /> : <StudentTable search={search} status={filter} />}
    </div>
  );
}
