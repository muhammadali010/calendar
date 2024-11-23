import React, { useState } from "react";
import {format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isBefore, isAfter,} from "date-fns";

interface Note {
  date: string;
  title: string;
}

const MIN_DATE = new Date(1970, 0, 1); 
const MAX_DATE = new Date(2200, 0, 1); 

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDate, setNoteDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const openModal = (note: Note | null = null) => {
    setShowModal(true);
    setEditingNote(note);
    setNoteTitle(note?.title || "");
    setNoteDate(note?.date || format(selectedDate, "yyyy-MM-dd"));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setNoteTitle("");
    setNoteDate(format(selectedDate, "yyyy-MM-dd"));
  };

  const saveNote = () => {
    const updatedNotes = { ...notes };

    if (editingNote) {
      const oldDate = editingNote.date;
      const noteList = updatedNotes[oldDate]?.filter((note) => note !== editingNote) || [];
      if (noteList.length > 0) {
        updatedNotes[oldDate] = noteList;
      } else {
        delete updatedNotes[oldDate];
      }

      if (!updatedNotes[noteDate]) updatedNotes[noteDate] = [];
      updatedNotes[noteDate].push({ date: noteDate, title: noteTitle });
    } else {
      if (!updatedNotes[noteDate]) updatedNotes[noteDate] = [];
      updatedNotes[noteDate].push({ date: noteDate, title: noteTitle });
    }

    setNotes(updatedNotes);
    closeModal();
  };

  const deleteNote = (noteToDelete: Note) => {
    const updatedNotes = { ...notes };
    updatedNotes[noteToDelete.date] = updatedNotes[noteToDelete.date]?.filter(
      (note) => note !== noteToDelete
    );
    if (updatedNotes[noteToDelete.date]?.length === 0) {
      delete updatedNotes[noteToDelete.date];
    }
    setNotes(updatedNotes);
  };

  const handleMonthChange = (increment: number) => {
    const newMonth = increment > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);

    if (isBefore(newMonth, MIN_DATE) || isAfter(newMonth, MAX_DATE)) {
      return;
    }
    setCurrentMonth(newMonth);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-md mb-4">
      <button
        onClick={() => handleMonthChange(-1)}
        className="text-xl font-bold hover:text-gray-300"
      >
        &lt;
      </button>
      <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
      <button
        onClick={() => handleMonthChange(1)}
        className="text-xl font-bold hover:text-gray-300"
      >
        &gt;
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(new Date());
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium uppercase text-gray-700">
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b pb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "yyyy-MM-dd");
        days.push(
          <div
            key={day.toString()}
            className={`p-2 w-24 h-24 border flex flex-col justify-between ${
              !isSameMonth(day, monthStart) ? "text-gray-400 bg-gray-50" : "bg-white"
            } hover:bg-blue-100 rounded-md`}
            onClick={() => setSelectedDate(day)}
          >
            <div className="text-sm">{format(day, "d")}</div>
            {notes[formattedDate]?.map((note, idx) => (
              <div key={idx} className="text-xs bg-blue-200 p-1 rounded mt-1">
                <div className="flex justify-between items-center">
                  <span>{note.title}</span>
                  <div className="ml-2 flex space-x-1">
                    <button
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 shadow-lg rounded-md">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        onClick={() => openModal()}
      >
        Add Event
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingNote ? "Edit Event" : "Add New Event"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                className="border p-2 w-full rounded-md"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                className="border p-2 w-full rounded-md"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                onClick={saveNote}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
